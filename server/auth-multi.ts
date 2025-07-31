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

// ORGANIZATION ADMIN API ROUTES
// ===============================

// Students Management
router.get("/api/org/students", async (req, res) => {
  try {
    const orgId = req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const { data: students, error } = await supabase
      .from("students")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching students:", error);
      return res.status(500).json({ message: "Failed to fetch students" });
    }

    res.json(students);
  } catch (error) {
    console.error("Error in students route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/org/students", async (req, res) => {
  try {
    const { orgId, ...studentData } = req.body;
    
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const { data: student, error } = await supabase
      .from("students")
      .insert({
        org_id: orgId,
        ...studentData
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating student:", error);
      return res.status(500).json({ message: "Failed to create student" });
    }

    res.status(201).json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/api/org/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: student, error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating student:", error);
      return res.status(500).json({ message: "Failed to update student" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/org/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting student:", error);
      return res.status(500).json({ message: "Failed to delete student" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Teachers Management
router.get("/api/org/teachers", async (req, res) => {
  try {
    const orgId = req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const { data: teachers, error } = await supabase
      .from("teachers")
      .select(`
        *,
        teacher_subjects (
          subjects (*)
        )
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching teachers:", error);
      return res.status(500).json({ message: "Failed to fetch teachers" });
    }

    res.json(teachers);
  } catch (error) {
    console.error("Error in teachers route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/org/teachers", async (req, res) => {
  try {
    const { orgId, subjects = [], ...teacherData } = req.body;
    
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    // Hash password if provided
    if (teacherData.password) {
      teacherData.password_hash = await hashPassword(teacherData.password);
      delete teacherData.password;
    }

    const { data: teacher, error } = await supabase
      .from("teachers")
      .insert({
        org_id: orgId,
        ...teacherData
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating teacher:", error);
      return res.status(500).json({ message: "Failed to create teacher" });
    }

    // Assign subjects to teacher
    if (subjects.length > 0) {
      const subjectAssignments = subjects.map((subjectId: string) => ({
        teacher_id: teacher.id,
        subject_id: subjectId
      }));

      await supabase
        .from("teacher_subjects")
        .insert(subjectAssignments);
    }

    res.status(201).json(teacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/api/org/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { subjects, ...updates } = req.body;

    // Hash password if being updated
    if (updates.password) {
      updates.password_hash = await hashPassword(updates.password);
      delete updates.password;
    }

    const { data: teacher, error } = await supabase
      .from("teachers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating teacher:", error);
      return res.status(500).json({ message: "Failed to update teacher" });
    }

    // Update subject assignments if provided
    if (subjects) {
      // Delete existing assignments
      await supabase
        .from("teacher_subjects")
        .delete()
        .eq("teacher_id", id);

      // Add new assignments
      if (subjects.length > 0) {
        const subjectAssignments = subjects.map((subjectId: string) => ({
          teacher_id: id,
          subject_id: subjectId
        }));

        await supabase
          .from("teacher_subjects")
          .insert(subjectAssignments);
      }
    }

    res.json(teacher);
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/org/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete teacher subject assignments first
    await supabase
      .from("teacher_subjects")
      .delete()
      .eq("teacher_id", id);

    // Delete teacher
    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting teacher:", error);
      return res.status(500).json({ message: "Failed to delete teacher" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Subjects Management
router.get("/api/org/subjects", async (req, res) => {
  try {
    const orgId = req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const { data: subjects, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("org_id", orgId)
      .order("class_level", { ascending: true });

    if (error) {
      console.error("Error fetching subjects:", error);
      return res.status(500).json({ message: "Failed to fetch subjects" });
    }

    res.json(subjects);
  } catch (error) {
    console.error("Error in subjects route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/org/subjects", async (req, res) => {
  try {
    const { orgId, ...subjectData } = req.body;
    
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const { data: subject, error } = await supabase
      .from("subjects")
      .insert({
        org_id: orgId,
        ...subjectData
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating subject:", error);
      return res.status(500).json({ message: "Failed to create subject" });
    }

    res.status(201).json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/api/org/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: subject, error } = await supabase
      .from("subjects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating subject:", error);
      return res.status(500).json({ message: "Failed to update subject" });
    }

    res.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/org/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting subject:", error);
      return res.status(500).json({ message: "Failed to delete subject" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Exams Management
router.get("/api/org/exams", async (req, res) => {
  try {
    const orgId = req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const { data: exams, error } = await supabase
      .from("exams")
      .select("*")
      .eq("org_id", orgId)
      .order("exam_date", { ascending: false });

    if (error) {
      console.error("Error fetching exams:", error);
      return res.status(500).json({ message: "Failed to fetch exams" });
    }

    res.json(exams);
  } catch (error) {
    console.error("Error in exams route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/org/exams", async (req, res) => {
  try {
    const { orgId, ...examData } = req.body;
    
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const { data: exam, error } = await supabase
      .from("exams")
      .insert({
        org_id: orgId,
        ...examData
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating exam:", error);
      return res.status(500).json({ message: "Failed to create exam" });
    }

    res.status(201).json(exam);
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Organization Dashboard Stats
router.get("/api/org/stats", async (req, res) => {
  try {
    const orgId = req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    // Get counts for dashboard
    const [studentsResult, teachersResult, subjectsResult, examsResult] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase.from("teachers").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase.from("subjects").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase.from("exams").select("id", { count: "exact", head: true }).eq("org_id", orgId)
    ]);

    res.json({
      totalStudents: studentsResult.count || 0,
      totalTeachers: teachersResult.count || 0,
      totalSubjects: subjectsResult.count || 0,
      totalExams: examsResult.count || 0
    });
  } catch (error) {
    console.error("Error fetching org stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Remove demo credentials from reset endpoint
router.post("/api/reset/admin", async (req, res) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: "Reset not allowed in production" });
    }

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
      console.error("Error creating default admin:", error);
      return res.status(500).json({ message: "Failed to create admin user" });
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