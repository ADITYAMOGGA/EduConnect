import { Router } from "express";
import bcrypt from "bcrypt";
import { supabase } from "./db";

const router = Router();

// Helper function to hash passwords
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

// Helper function to verify passwords
const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

// ADMIN LOGIN
router.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Query admin by username
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .eq("status", "active")
      .single();

    if (error || !admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await supabase
      .from("admins")
      .update({ last_login: new Date().toISOString() })
      .eq("id", admin.id);

    // Remove password from response
    const { password_hash, ...adminData } = admin;
    
    res.json({ admin: adminData });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ADMIN API ENDPOINTS

// Get system statistics
router.get("/api/admin/stats", async (req, res) => {
  try {
    // Get total users (admins + org_admins + teachers)
    const { data: admins } = await supabase.from("admins").select("id");
    const { data: orgAdmins } = await supabase.from("org_admins").select("id");
    const { data: teachers } = await supabase.from("teachers").select("id");
    
    // Get total organizations
    const { data: organizations } = await supabase.from("organizations").select("id");
    
    // Get total students
    const { data: students } = await supabase.from("students").select("id");
    
    const stats = {
      totalUsers: (admins?.length || 0) + (orgAdmins?.length || 0) + (teachers?.length || 0),
      totalSchools: organizations?.length || 0,
      totalStudents: students?.length || 0,
      totalAdmins: admins?.length || 0,
      totalOrgAdmins: orgAdmins?.length || 0,
      totalTeachers: teachers?.length || 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// Get system health
router.get("/api/admin/health", async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabase.from("admins").select("id").limit(1);
    
    const health = {
      database: error ? 'error' : 'connected',
      timestamp: new Date().toISOString(),
      status: 'operational'
    };
    
    res.json(health);
  } catch (error) {
    console.error("Error checking system health:", error);
    res.json({
      database: 'error',
      timestamp: new Date().toISOString(),
      status: 'error'
    });
  }
});

// Get all users (admins only)
router.get("/api/admin/users", async (req, res) => {
  try {
    // Get all admins
    const { data: admins } = await supabase
      .from("admins")
      .select("id, username, name, email, role, status, created_at, last_login");
    
    // Get all org admins
    const { data: orgAdmins } = await supabase
      .from("org_admins")
      .select("id, username, name, email, role, status, created_at, organization_id");
    
    // Get all teachers
    const { data: teachers } = await supabase
      .from("teachers")
      .select("id, username, name, email, role, status, created_at, organization_id");
    
    // Combine all users with role information
    const allUsers = [
      ...(admins || []).map(user => ({ ...user, userType: 'admin' })),
      ...(orgAdmins || []).map(user => ({ ...user, userType: 'org_admin' })),
      ...(teachers || []).map(user => ({ ...user, userType: 'teacher' }))
    ];
    
    res.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Create new admin user
router.post("/api/admin/users", async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, role = 'admin', status = 'active' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Check if username already exists
    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id")
      .eq("username", username)
      .single();
    
    if (existingAdmin) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create new admin
    const { data: newAdmin, error } = await supabase
      .from("admins")
      .insert({
        username,
        password_hash: passwordHash,
        name: `${firstName || ''} ${lastName || ''}`.trim(),
        email,
        role,
        status
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating admin:", error);
      return res.status(500).json({ message: "Failed to create admin user" });
    }
    
    // Remove password from response
    const { password_hash, ...adminData } = newAdmin;
    res.json({ admin: adminData });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user status (hold/activate)
router.patch("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Update admin user
    const { data: updatedAdmin, error } = await supabase
      .from("admins")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating admin:", error);
      return res.status(500).json({ message: "Failed to update user" });
    }
    
    // Remove password from response
    const { password_hash, ...adminData } = updatedAdmin;
    res.json({ admin: adminData });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete user
router.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete admin user
    const { error } = await supabase
      .from("admins")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting admin:", error);
      return res.status(500).json({ message: "Failed to delete user" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ORGANIZATION SIGNUP
router.post("/api/org/signup", async (req, res) => {
  try {
    const { 
      // Organization data
      orgName, 
      address, 
      phone, 
      email, 
      boardType = 'CBSE',
      establishedYear,
      website,
      principalName,
      // Admin user data
      adminUsername,
      adminName,
      adminPassword,
      adminPhone,
      designation = 'Principal'
    } = req.body;

    // Validate required fields
    if (!orgName || !adminUsername || !adminName || !adminPassword) {
      return res.status(400).json({ 
        message: "Organization name, admin username, name, and password are required" 
      });
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from("org_admins")
      .select("username")
      .eq("username", adminUsername)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: orgName,
        address,
        phone,
        email,
        board_type: boardType,
        established_year: establishedYear,
        website,
        principal_name: principalName || adminName
      })
      .select()
      .single();

    if (orgError) {
      console.error("Organization creation error:", orgError);
      return res.status(500).json({ message: "Failed to create organization" });
    }

    // Create org admin
    const { data: orgAdmin, error: adminError } = await supabase
      .from("org_admins")
      .insert({
        org_id: organization.id,
        username: adminUsername,
        name: adminName,
        email,
        password_hash: passwordHash,
        phone: adminPhone,
        designation
      })
      .select()
      .single();

    if (adminError) {
      console.error("Org admin creation error:", adminError);
      // Cleanup: delete the organization if admin creation fails
      await supabase.from("organizations").delete().eq("id", organization.id);
      return res.status(500).json({ message: "Failed to create admin user" });
    }

    // Remove password from response
    const { password_hash, ...adminData } = orgAdmin;

    res.status(201).json({ 
      organization, 
      orgAdmin: adminData,
      message: "Organization and admin account created successfully" 
    });
  } catch (error) {
    console.error("Organization signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ORG ADMIN LOGIN
router.post("/api/org/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Query org admin by username with organization data
    const { data: orgAdmin, error } = await supabase
      .from("org_admins")
      .select(`
        *,
        organizations (*)
      `)
      .eq("username", username)
      .eq("status", "active")
      .single();

    if (error || !orgAdmin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, orgAdmin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await supabase
      .from("org_admins")
      .update({ last_login: new Date().toISOString() })
      .eq("id", orgAdmin.id);

    // Remove password from response
    const { password_hash, organizations, ...adminData } = orgAdmin;
    
    res.json({ 
      orgAdmin: adminData, 
      organization: organizations 
    });
  } catch (error) {
    console.error("Org admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// TEACHER LOGIN
router.post("/api/teacher/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Query teacher by username with organization and subject data
    const { data: teacher, error } = await supabase
      .from("teachers")
      .select(`
        *,
        organizations (*),
        teacher_subjects (
          subjects (*)
        )
      `)
      .eq("username", username)
      .eq("status", "active")
      .single();

    if (error || !teacher) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, teacher.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await supabase
      .from("teachers")
      .update({ last_login: new Date().toISOString() })
      .eq("id", teacher.id);

    // Extract subjects from teacher_subjects relation
    const subjects = teacher.teacher_subjects?.map((ts: any) => ts.subjects) || [];

    // Remove password from response
    const { password_hash, organizations, teacher_subjects, ...teacherData } = teacher;
    
    res.json({ 
      teacher: teacherData, 
      organization: organizations,
      subjects 
    });
  } catch (error) {
    console.error("Teacher login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// SETUP ROUTE - Create default admin user (for initial setup)
router.post("/api/setup/admin", async (req, res) => {
  try {
    const { force = false } = req.body;
    
    // Check if any admin users already exist
    const { data: existingAdmins } = await supabase
      .from("admins")
      .select("id")
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0 && !force) {
      return res.status(400).json({ message: "Admin users already exist. Use force=true to create anyway." });
    }

    // Create default admin user
    const defaultAdmin = {
      username: "admin",
      password: "admin123",
      name: "System Administrator",
      email: "admin@marksheetpro.com",
      role: "admin",
      status: "active"
    };

    const passwordHash = await hashPassword(defaultAdmin.password);

    const { data: newAdmin, error } = await supabase
      .from("admins")
      .insert({
        username: defaultAdmin.username,
        password_hash: passwordHash,
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        role: defaultAdmin.role,
        status: defaultAdmin.status
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating default admin:", error);
      return res.status(500).json({ message: "Failed to create default admin" });
    }

    const { password_hash, ...adminData } = newAdmin;
    res.json({ 
      admin: adminData, 
      message: "Default admin user created successfully",
      credentials: {
        username: defaultAdmin.username,
        password: defaultAdmin.password
      }
    });
  } catch (error) {
    console.error("Setup admin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// RESET ADMIN - Create new admin user (for development/setup)
router.post("/api/reset/admin", async (req, res) => {
  try {
    // Delete all existing admins
    await supabase.from("admins").delete().neq("id", "");

    // Create new admin user
    const defaultAdmin = {
      username: "admin",
      password: "admin123",
      name: "System Administrator",
      email: "admin@marksheetpro.com",
      role: "admin",
      status: "active"
    };

    const passwordHash = await hashPassword(defaultAdmin.password);

    const { data: newAdmin, error } = await supabase
      .from("admins")
      .insert({
        username: defaultAdmin.username,
        password_hash: passwordHash,
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        role: defaultAdmin.role,
        status: defaultAdmin.status
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating admin:", error);
      return res.status(500).json({ message: "Failed to create admin" });
    }

    const { password_hash, ...adminData } = newAdmin;
    res.json({ 
      admin: adminData, 
      message: "Admin user reset successfully",
      credentials: {
        username: defaultAdmin.username,
        password: defaultAdmin.password
      }
    });
  } catch (error) {
    console.error("Reset admin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;