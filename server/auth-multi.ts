import { Router } from "express";
import bcrypt from "bcrypt";
import { supabase } from "./db";
import multer from "multer";
import Papa from "papaparse";
import { logActivity, getClientInfo, ACTIVITIES } from "./activity-logger";

const router = Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

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

    // Log admin login activity
    const clientInfo = getClientInfo(req);
    await logActivity({
      orgId: 'system', // System-wide admin
      userId: admin.id,
      userType: 'admin',
      userName: admin.username,
      activity: ACTIVITIES.LOGIN,
      description: `Admin ${admin.username} logged in`,
      metadata: { loginTime: new Date().toISOString() },
      ...clientInfo,
    });

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

// Get all schools/organizations for admin
router.get("/api/admin/schools", async (req, res) => {
  try {
    const { data: schools, error } = await supabase
      .from("organizations")
      .select(`
        *,
        org_admins (
          id,
          name,
          email,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching schools:", error);
      return res.status(500).json({ message: "Failed to fetch schools" });
    }

    res.json(schools);
  } catch (error) {
    console.error("Error in schools route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new school/organization
router.post("/api/admin/schools", async (req, res) => {
  try {
    const { name, address, phone, email, website, board_affiliation } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: "School name and email are required" });
    }

    const { data: school, error } = await supabase
      .from("organizations")
      .insert({
        name,
        address,
        phone,
        email,
        website,
        board_affiliation,
        status: "active"
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating school:", error);
      return res.status(500).json({ message: "Failed to create school" });
    }

    res.status(201).json(school);
  } catch (error) {
    console.error("Error creating school:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update school status
router.patch("/api/admin/schools/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: school, error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating school:", error);
      return res.status(500).json({ message: "Failed to update school" });
    }

    res.json(school);
  } catch (error) {
    console.error("Error updating school:", error);
    res.status(500).json({ message: "Internal server error" });
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
    
    // Get all org admins with organization name
    const { data: orgAdmins } = await supabase
      .from("org_admins")
      .select(`
        id, username, name, email, designation, status, created_at, org_id,
        organizations!inner(name)
      `);
    
    // Get all teachers with organization name
    const { data: teachers } = await supabase
      .from("teachers")
      .select(`
        id, username, name, email, qualification, status, created_at, org_id,
        organizations!inner(name)
      `);
    
    // Combine all users with proper formatting for frontend
    const allUsers = [
      ...(admins || []).map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        schoolName: 'Platform Administration',
        role: user.role || 'admin',
        status: user.status,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        userType: 'Platform Admin'
      })),
      ...(orgAdmins || []).map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        schoolName: (user.organizations as any)?.name || 'Unknown School',
        role: 'school_admin',
        status: user.status,
        createdAt: user.created_at,
        designation: user.designation,
        userType: 'School Admin'
      })),
      ...(teachers || []).map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        schoolName: (user.organizations as any)?.name || 'Unknown School',
        role: 'teacher',
        status: user.status,
        createdAt: user.created_at,
        qualification: user.qualification,
        userType: 'Teacher'
      }))
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
// Get recent activities for organization
router.get("/api/org/activities", requireOrgAuth, async (req, res) => {
  try {
    const orgId = (req as any).orgId;
    const limit = parseInt(req.query.limit as string) || 50;

    const { data: activities, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching activities:", error);
      return res.status(500).json({ message: "Failed to fetch activities" });
    }

    res.json(activities || []);
  } catch (error) {
    console.error("Error in activities route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

    // Log organization admin login activity
    const clientInfo = getClientInfo(req);
    await logActivity({
      orgId: orgAdmin.org_id,
      userId: orgAdmin.id,
      userType: 'org_admin',
      userName: orgAdmin.username,
      activity: ACTIVITIES.LOGIN,
      description: `School Admin ${orgAdmin.username} logged in`,
      metadata: { loginTime: new Date().toISOString() },
      ...clientInfo,
    });

    // Remove password from response
    const { password_hash, organizations, ...adminData } = orgAdmin;
    
    // Store in session for subsequent requests
    (req as any).session.orgAdmin = adminData;
    (req as any).session.organization = organizations;
    (req as any).session.orgId = organizations.id;
    
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

    // Log teacher login activity
    const clientInfo = getClientInfo(req);
    await logActivity({
      orgId: teacher.org_id,
      userId: teacher.id,
      userType: 'teacher',
      userName: teacher.username,
      activity: ACTIVITIES.LOGIN,
      description: `Teacher ${teacher.username} logged in`,
      metadata: { loginTime: new Date().toISOString() },
      ...clientInfo,
    });

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

// Middleware to check org admin authentication and extract orgId
function requireOrgAuth(req: any, res: any, next: any) {
  // Check if user is authenticated
  if (!req.session?.orgAdmin && !req.session?.teacher) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  // Get orgId from multiple sources
  const orgId = req.query.orgId || req.body.orgId || req.session?.orgId || req.session?.organization?.id;
  if (!orgId) {
    return res.status(400).json({ message: "Organization ID is required" });
  }
  
  req.orgId = orgId;
  next();
}

// Add session user endpoint for org admins
router.get("/api/org/auth/user", (req: any, res) => {
  if (!req.session?.orgAdmin) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  res.json({
    orgAdmin: req.session.orgAdmin,
    organization: req.session.organization
  });
});

// ORGANIZATION ADMIN API ROUTES
// ===============================

// Students Management
router.get("/api/org/students", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;

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

router.post("/api/org/students", requireOrgAuth, async (req: any, res) => {
  try {
    const { orgId, ...studentData } = req.body;
    const actualOrgId = orgId || req.orgId;

    const { data: student, error } = await supabase
      .from("students")
      .insert({
        org_id: actualOrgId,
        ...studentData
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating student:", error);
      return res.status(500).json({ message: "Failed to create student" });
    }

    // Log student creation activity
    const clientInfo = getClientInfo(req);
    await logActivity({
      orgId: actualOrgId,
      userId: req.userId || 'system',
      userType: 'org_admin',
      userName: req.userName || 'Admin',
      activity: ACTIVITIES.CREATE_STUDENT,
      description: `Created new student: ${studentData.name}`,
      metadata: { 
        studentId: student.id, 
        admissionNo: studentData.admission_no,
        classLevel: studentData.class_level,
        section: studentData.section 
      },
      ...clientInfo,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/api/org/students/:id", requireOrgAuth, async (req: any, res) => {
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

router.delete("/api/org/students/:id", requireOrgAuth, async (req: any, res) => {
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

// Import students from CSV
router.post("/api/org/students/import", requireOrgAuth, upload.single('file'), async (req: any, res) => {
  try {
    const orgId = req.body.orgId || req.orgId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    // Parse CSV file using Papa Parse for proper handling of quoted fields
    const csvData = file.buffer.toString('utf8');
    console.log("Raw CSV data:", csvData);
    
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      console.log("CSV parsing errors:", parseResult.errors);
      return res.status(400).json({ 
        message: `CSV parsing error: ${parseResult.errors[0].message}` 
      });
    }

    const students = parseResult.data as any[];
    console.log("Parsed students:", students);
    
    const requiredFields = ['name', 'admission_no', 'class_level'];
    const headers = Object.keys(students[0] || {});
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required columns: ${missingFields.join(', ')}` 
      });
    }

    let imported = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    // Process each row
    for (let i = 0; i < students.length; i++) {
      const studentRow = students[i];
      console.log(`Processing row ${i + 1}:`, studentRow);
      
      // Skip empty rows
      if (!studentRow.name && !studentRow.admission_no) {
        continue;
      }

      // Map CSV column names to database column names
      const studentData: any = { 
        org_id: orgId,
        name: studentRow.name,
        admission_no: studentRow.admission_no,
        class_level: studentRow.class_level,
        section: studentRow.section,
        roll_no: studentRow.roll_no,
        father_name: studentRow.father_name,
        mother_name: studentRow.mother_name,
        phone: studentRow.phone,
        address: studentRow.address,
        date_of_birth: studentRow.date_of_birth,
        gender: studentRow.gender,
        email: studentRow.email
      };
      console.log(`Student data for row ${i + 1}:`, studentData);

      // Validate required fields
      if (!studentData.name || !studentData.admission_no || !studentData.class_level) {
        errors++;
        const missingFieldsMsg = `Row ${i + 1}: Missing required fields - name: ${studentData.name}, admission_no: ${studentData.admission_no}, class_level: ${studentData.class_level}`;
        errorMessages.push(missingFieldsMsg);
        console.log(missingFieldsMsg);
        continue;
      }

      try {
        const { error } = await supabase
          .from("students")
          .insert(studentData);

        if (error) {
          errors++;
          errorMessages.push(`Row ${i + 1}: ${error.message}`);
          console.log(`Database error for row ${i + 1}:`, error);
        } else {
          imported++;
          console.log(`Successfully imported row ${i + 1}`);
        }
      } catch (error) {
        errors++;
        errorMessages.push(`Row ${i + 1}: Database error`);
        console.log(`Exception for row ${i + 1}:`, error);
      }
    }

    console.log("Import result:", { imported, errors, errorMessages });
    res.json({
      imported,
      errors,
      errorMessages: errorMessages.slice(0, 10) // Limit error messages
    });

  } catch (error) {
    console.error("Error importing students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Teachers Management
router.get("/api/org/teachers", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;

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

router.post("/api/org/teachers", requireOrgAuth, async (req: any, res) => {
  try {
    const { orgId, subjects = [], ...teacherData } = req.body;
    const actualOrgId = orgId || req.orgId;

    // Hash password if provided
    if (teacherData.password) {
      teacherData.password_hash = await hashPassword(teacherData.password);
      delete teacherData.password;
    }

    const { data: teacher, error } = await supabase
      .from("teachers")
      .insert({
        org_id: actualOrgId,
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

    // Log teacher creation activity
    const clientInfo = getClientInfo(req);
    await logActivity({
      orgId: actualOrgId,
      userId: req.userId || 'system',
      userType: 'org_admin',
      userName: req.userName || 'Admin',
      activity: ACTIVITIES.CREATE_TEACHER,
      description: `Created new teacher: ${teacherData.name}`,
      metadata: { teacherId: teacher.id, username: teacherData.username },
      ...clientInfo,
    });

    res.status(201).json(teacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/api/org/teachers/:id", requireOrgAuth, async (req: any, res) => {
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

router.delete("/api/org/teachers/:id", requireOrgAuth, async (req: any, res) => {
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
router.get("/api/org/subjects", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;
    const { class: classLevel } = req.query;

    let query = supabase
      .from("subjects")
      .select("*")
      .eq("org_id", orgId);

    // Filter by class level if provided
    if (classLevel && classLevel !== 'all') {
      query = query.eq("class_level", classLevel);
    }

    const { data: subjects, error } = await query
      .order("class_level", { ascending: true })
      .order("name", { ascending: true });

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

router.post("/api/org/subjects", requireOrgAuth, async (req: any, res) => {
  try {
    const { orgId, ...subjectData } = req.body;
    const actualOrgId = orgId || req.orgId;

    const { data: subject, error } = await supabase
      .from("subjects")
      .insert({
        org_id: actualOrgId,
        ...subjectData
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating subject:", error);
      return res.status(500).json({ message: "Failed to create subject" });
    }

    // Log subject creation activity
    const clientInfo = getClientInfo(req);
    await logActivity({
      orgId: actualOrgId,
      userId: req.userId || 'system',
      userType: 'org_admin',
      userName: req.userName || 'Admin',
      activity: ACTIVITIES.CREATE_SUBJECT,
      description: `Created new subject: ${subjectData.name}`,
      metadata: { 
        subjectId: subject.id, 
        code: subjectData.code,
        classLevel: subjectData.class_level,
        maxMarks: subjectData.max_marks 
      },
      ...clientInfo,
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/api/org/subjects/:id", requireOrgAuth, async (req: any, res) => {
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

router.delete("/api/org/subjects/:id", requireOrgAuth, async (req: any, res) => {
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
      .order("created_at", { ascending: false });

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
router.get("/api/org/stats", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;

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

// Profile and organization update endpoints
router.patch("/api/org/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, ...updates } = req.body;

    // If password update is requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      // Verify current password
      const { data: orgAdmin } = await supabase
        .from("org_admins")
        .select("password_hash")
        .eq("id", id)
        .single();

      if (!orgAdmin || !await verifyPassword(currentPassword, orgAdmin.password_hash)) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      updates.password_hash = await hashPassword(newPassword);
    }

    const { data: updatedAdmin, error } = await supabase
      .from("org_admins")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: "Failed to update profile" });
    }

    const { password_hash, ...adminData } = updatedAdmin;
    res.json(adminData);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/api/org/organization/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: updatedOrg, error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating organization:", error);
      return res.status(500).json({ message: "Failed to update organization" });
    }

    res.json(updatedOrg);
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// MARKS MANAGEMENT API ENDPOINTS
// ================================

// Bulk import marks from CSV - Single student/mark entry
router.post("/api/marks/bulk-import-single", async (req, res) => {
  try {
    const { examId, studentName, subject, marks, maxMarks = 100 } = req.body;

    if (!examId || !studentName || !subject || marks === undefined || marks === null) {
      return res.status(400).json({ message: "Exam ID, student name, subject, and marks are required" });
    }

    // Find student by name (case-insensitive search)
    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("id, name")
      .ilike("name", `%${studentName.trim()}%`);

    if (studentError || !students || students.length === 0) {
      return res.status(404).json({ message: `Student "${studentName}" not found` });
    }

    // Get the closest match (exact or first partial match)
    const student = students.find(s => s.name.toLowerCase() === studentName.toLowerCase()) || students[0];

    // Check if mark already exists for this student/exam/subject
    const { data: existingMark } = await supabase
      .from("marks")
      .select("id")
      .eq("student_id", student.id)
      .eq("exam_id", examId)
      .eq("subject_name", subject)
      .single();

    if (existingMark) {
      // Update existing mark
      const { data: updatedMark, error: updateError } = await supabase
        .from("marks")
        .update({
          marks_obtained: Number(marks),
          max_marks: Number(maxMarks),
          updated_at: new Date().toISOString()
        })
        .eq("id", existingMark.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating mark:", updateError);
        return res.status(500).json({ message: "Failed to update mark" });
      }

      res.json({ mark: updatedMark, action: 'updated' });
    } else {
      // Create new mark
      const { data: newMark, error: createError } = await supabase
        .from("marks")
        .insert({
          student_id: student.id,
          exam_id: examId,
          subject_name: subject,
          marks_obtained: Number(marks),
          max_marks: Number(maxMarks)
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating mark:", createError);
        return res.status(500).json({ message: "Failed to create mark" });
      }

      res.json({ mark: newMark, action: 'created' });
    }
  } catch (error) {
    console.error("Error in bulk import single:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get marks for a specific exam
router.get("/api/marks/:examId", async (req, res) => {
  try {
    const { examId } = req.params;

    const { data: marks, error } = await supabase
      .from("marks")
      .select(`
        *,
        students (id, name, admission_no, class_level)
      `)
      .eq("exam_id", examId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching marks:", error);
      return res.status(500).json({ message: "Failed to fetch marks" });
    }

    res.json(marks);
  } catch (error) {
    console.error("Error in marks route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new mark
router.post("/api/marks", async (req, res) => {
  try {
    const { studentId, examId, subject, marks, maxMarks = 100 } = req.body;

    if (!studentId || !examId || !subject || marks === undefined) {
      return res.status(400).json({ message: "Student ID, exam ID, subject, and marks are required" });
    }

    const { data: newMark, error } = await supabase
      .from("marks")
      .insert({
        student_id: studentId,
        exam_id: examId,
        subject_name: subject,
        marks_obtained: Number(marks),
        max_marks: Number(maxMarks)
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating mark:", error);
      return res.status(500).json({ message: "Failed to create mark" });
    }

    res.status(201).json(newMark);
  } catch (error) {
    console.error("Error creating mark:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a mark
router.patch("/api/marks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, maxMarks } = req.body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (marks !== undefined) updates.marks_obtained = Number(marks);
    if (maxMarks !== undefined) updates.max_marks = Number(maxMarks);

    const { data: updatedMark, error } = await supabase
      .from("marks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating mark:", error);
      return res.status(500).json({ message: "Failed to update mark" });
    }

    res.json(updatedMark);
  } catch (error) {
    console.error("Error updating mark:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GENERAL API ENDPOINTS FOR FRONTEND COMPATIBILITY
// ==============================================

// Get all exams (for teacher/marks entry compatibility)
router.get("/api/exams", async (req, res) => {
  try {
    const { data: exams, error } = await supabase
      .from("exams")
      .select("*")
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

// Get all students (for teacher/marks entry compatibility)
router.get("/api/students", async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching students:", error);
      return res.status(500).json({ message: "Failed to fetch students" });
    }

    // Map database fields to frontend expected format
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      admissionNumber: student.admission_no,
      class: student.class_level,
      email: student.email || '',
      rollNumber: student.roll_no,
      fatherName: student.father_name,
      motherName: student.mother_name,
      phone: student.phone,
      address: student.address,
      dateOfBirth: student.date_of_birth
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error("Error in students route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all subjects (for teacher/marks entry compatibility)
router.get("/api/subjects", async (req, res) => {
  try {
    const { data: subjects, error } = await supabase
      .from("subjects")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching subjects:", error);
      return res.status(500).json({ message: "Failed to fetch subjects" });
    }

    // Map database fields to frontend expected format
    const formattedSubjects = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code || subject.name.substring(0, 3).toUpperCase(),
      maxMarks: subject.max_marks || 100
    }));

    res.json(formattedSubjects);
  } catch (error) {
    console.error("Error in subjects route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create test data for demonstration
router.post("/api/setup/test-data", async (req, res) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: "Test data creation not allowed in production" });
    }

    // Check if we already have an organization
    const { data: existingOrgs } = await supabase
      .from("organizations")
      .select("id")
      .limit(1);

    let orgId;
    if (!existingOrgs || existingOrgs.length === 0) {
      // Create test organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: "Demo High School",
          address: "123 Education Street, Knowledge City",
          phone: "+91 98765 43210",
          email: "admin@demohighschool.edu",
          board_type: "CBSE",
          established_year: 2010,
          principal_name: "Dr. Education Master"
        })
        .select()
        .single();

      if (orgError) {
        console.error("Error creating test organization:", orgError);
        return res.status(500).json({ message: "Failed to create test organization" });
      }
      orgId = org.id;
    } else {
      orgId = existingOrgs[0].id;
    }

    // Create test students
    const testStudents = [
      { name: "Nikhil Varma", admission_no: "2024001", class_level: "10", section: "A", roll_no: "1" },
      { name: "Bhavani Devi", admission_no: "2024002", class_level: "10", section: "A", roll_no: "2" },
      { name: "Teja Reddy", admission_no: "2024003", class_level: "10", section: "A", roll_no: "3" },
      { name: "Arjun Kumar", admission_no: "2024004", class_level: "10", section: "B", roll_no: "1" },
      { name: "Priya Sharma", admission_no: "2024005", class_level: "10", section: "B", roll_no: "2" }
    ];

    for (const student of testStudents) {
      await supabase
        .from("students")
        .insert({
          org_id: orgId,
          ...student,
          father_name: "Father Name",
          mother_name: "Mother Name",
          phone: "+91 9876543210",
          address: "Student Address",
          date_of_birth: "2008-01-01"
        });
    }

    // Create test subjects
    const testSubjects = [
      { name: "Science", code: "SCI", max_marks: 100 },
      { name: "Social Studies", code: "SS", max_marks: 100 },
      { name: "Mathematics", code: "MATH", max_marks: 100 },
      { name: "English", code: "ENG", max_marks: 100 },
      { name: "Hindi", code: "HIN", max_marks: 100 }
    ];

    for (const subject of testSubjects) {
      await supabase
        .from("subjects")
        .insert({
          org_id: orgId,
          class_level: "10",
          ...subject
        });
    }

    // Create test exam (using correct schema fields)
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .insert({
        org_id: orgId,
        name: "Mid Term Exam 2025",
        class_level: "10",
        exam_type: "Mid Term",
        start_date: "2025-02-15",
        end_date: "2025-02-20",
        academic_year: "2024-25",
        status: "active"
      })
      .select()
      .single();

    if (examError) {
      console.error("Error creating test exam:", examError);
      return res.status(500).json({ message: "Failed to create test exam" });
    }

    res.json({
      message: "Test data created successfully",
      organization: { id: orgId, name: "Demo High School" },
      studentsCreated: testStudents.length,
      subjectsCreated: testSubjects.length,
      examCreated: exam.name
    });

  } catch (error) {
    console.error("Error creating test data:", error);
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

// Teacher-Subject Assignment Management
router.get("/api/org/teacher-subjects", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;

    const { data: assignments, error } = await supabase
      .from("teacher_subjects")
      .select(`
        *,
        teachers!inner(id, name, email, phone, qualification, employee_id),
        subjects!inner(id, name, code, class_level, max_marks)
      `)
      .eq("teachers.org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching teacher-subject assignments:", error);
      return res.status(500).json({ message: "Failed to fetch assignments" });
    }

    // Transform the data to match the expected structure
    const transformedAssignments = assignments?.map(assignment => ({
      id: assignment.id,
      teacherId: assignment.teacher_id,
      subjectId: assignment.subject_id,
      classLevel: assignment.class_level,
      academicYear: assignment.academic_year,
      createdAt: assignment.created_at,
      teacher: assignment.teachers,
      subject: assignment.subjects
    }));

    res.json(transformedAssignments || []);
  } catch (error) {
    console.error("Error in teacher-subjects route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/org/teacher-subjects", requireOrgAuth, async (req: any, res) => {
  try {
    const { teacherId, subjectId, classLevel, academicYear } = req.body;

    if (!teacherId || !subjectId || !classLevel) {
      return res.status(400).json({ message: "Teacher ID, Subject ID, and Class Level are required" });
    }

    // Check if assignment already exists
    const { data: existing } = await supabase
      .from("teacher_subjects")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("subject_id", subjectId)
      .eq("class_level", classLevel)
      .eq("academic_year", academicYear || "2024-25")
      .single();

    if (existing) {
      return res.status(400).json({ message: "This assignment already exists" });
    }

    const { data: assignment, error } = await supabase
      .from("teacher_subjects")
      .insert({
        teacher_id: teacherId,
        subject_id: subjectId,
        class_level: classLevel,
        academic_year: academicYear || "2024-25"
      })
      .select(`
        *,
        teachers!inner(id, name, email, phone, qualification, employee_id),
        subjects!inner(id, name, code, class_level, max_marks)
      `)
      .single();

    if (error) {
      console.error("Error creating assignment:", error);
      return res.status(500).json({ message: "Failed to create assignment" });
    }

    // Log teacher assignment activity
    const clientInfo = getClientInfo(req);
    await logActivity({
      orgId: req.orgId,
      userId: req.userId || 'system',
      userType: 'org_admin',
      userName: req.userName || 'Admin',  
      activity: ACTIVITIES.ASSIGN_TEACHER,
      description: `Assigned teacher to subject: ${assignment.teachers?.name} → ${assignment.subjects?.name} (Class ${classLevel})`,
      metadata: { 
        assignmentId: assignment.id,
        teacherId: teacherId,
        subjectId: subjectId,
        classLevel: classLevel,
        academicYear: academicYear || "2024-25"
      },
      ...clientInfo,
    });

    // Transform the data to match the expected structure
    const transformedAssignment = {
      id: assignment.id,
      teacherId: assignment.teacher_id,
      subjectId: assignment.subject_id,
      classLevel: assignment.class_level,
      academicYear: assignment.academic_year,
      createdAt: assignment.created_at,
      teacher: assignment.teachers,
      subject: assignment.subjects
    };

    res.status(201).json(transformedAssignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/org/teacher-subjects/:id", requireOrgAuth, async (req: any, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("teacher_subjects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting assignment:", error);
      return res.status(500).json({ message: "Failed to delete assignment" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Exam Management API
router.get("/api/org/exams", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;

    const { data: exams, error } = await supabase
      .from("exams")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching exams:", error);
      return res.status(500).json({ message: "Failed to fetch exams" });
    }

    res.json(exams || []);
  } catch (error) {
    console.error("Error in exams route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/org/exams", requireOrgAuth, async (req: any, res) => {
  try {
    const { orgId, ...examData } = req.body;
    const actualOrgId = orgId || req.orgId;

    const { data: exam, error } = await supabase
      .from("exams")
      .insert({
        org_id: actualOrgId,
        name: examData.name,
        description: examData.description,
        class_level: examData.classLevel,
        exam_type: examData.examType,
        exam_date: examData.examDate ? new Date(examData.examDate).toISOString() : null,
        total_marks: examData.totalMarks,
        passing_marks: examData.passingMarks,
        duration_minutes: examData.duration,
        academic_year: examData.academicYear,
        instructions: examData.instructions,
        status: "scheduled"
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

router.patch("/api/org/exams/:id", requireOrgAuth, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Transform the data for database
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.classLevel) dbUpdates.class_level = updates.classLevel;
    if (updates.examType) dbUpdates.exam_type = updates.examType;
    if (updates.examDate) dbUpdates.exam_date = new Date(updates.examDate).toISOString();
    if (updates.totalMarks) dbUpdates.total_marks = updates.totalMarks;
    if (updates.passingMarks) dbUpdates.passing_marks = updates.passingMarks;
    if (updates.duration) dbUpdates.duration_minutes = updates.duration;
    if (updates.academicYear) dbUpdates.academic_year = updates.academicYear;
    if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions;
    if (updates.status) dbUpdates.status = updates.status;

    const { data: exam, error } = await supabase
      .from("exams")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating exam:", error);
      return res.status(500).json({ message: "Failed to update exam" });
    }

    res.json(exam);
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/org/exams/:id", requireOrgAuth, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Delete related marks first
    await supabase
      .from("marks")
      .delete()
      .eq("exam_id", id);

    // Delete exam
    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting exam:", error);
      return res.status(500).json({ message: "Failed to delete exam" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Marks Management API
router.get("/api/org/marks", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;
    const { examId, subjectId, classLevel } = req.query;

    let query = supabase
      .from("marks")
      .select(`
        *,
        students!inner(id, name, admission_no, class_level, section, roll_no),
        subjects!inner(id, name, code, class_level, max_marks)
      `)
      .eq("org_id", orgId);

    if (examId) query = query.eq("exam_id", examId);
    if (subjectId) query = query.eq("subject_id", subjectId);
    if (classLevel) query = query.eq("students.class_level", classLevel);

    const { data: marks, error } = await query.order("students.name", { ascending: true });

    if (error) {
      console.error("Error fetching marks:", error);
      return res.status(500).json({ message: "Failed to fetch marks" });
    }

    // Transform the data to match expected structure
    const transformedMarks = marks?.map(mark => ({
      id: mark.id,
      orgId: mark.org_id,
      studentId: mark.student_id,
      examId: mark.exam_id,
      subjectId: mark.subject_id,
      subjectName: mark.subject_name,
      marksObtained: mark.marks_obtained,
      maxMarks: mark.max_marks,
      grade: mark.grade,
      remarks: mark.remarks,
      status: mark.status,
      student: mark.students,
      subject: mark.subjects
    }));

    res.json(transformedMarks || []);
  } catch (error) {
    console.error("Error in marks route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/org/marks/bulk-create", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;
    const { examId, subjectId, studentIds } = req.body;

    if (!examId || !subjectId || !studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: "Exam ID, Subject ID, and Student IDs are required" });
    }

    // Get subject details for max marks
    const { data: subject } = await supabase
      .from("subjects")
      .select("name, max_marks")
      .eq("id", subjectId)
      .single();

    const marksData = studentIds.map(studentId => ({
      org_id: orgId,
      student_id: studentId,
      exam_id: examId,
      subject_id: subjectId,
      subject_name: subject?.name || "Unknown Subject",
      marks_obtained: 0,
      max_marks: subject?.max_marks || 100,
      status: "draft"
    }));

    const { data: marks, error } = await supabase
      .from("marks")
      .insert(marksData)
      .select();

    if (error) {
      console.error("Error creating marks:", error);
      return res.status(500).json({ message: "Failed to create marks" });
    }

    res.status(201).json(marks);
  } catch (error) {
    console.error("Error creating marks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/api/org/marks/bulk-update", requireOrgAuth, async (req: any, res) => {
  try {
    const orgId = req.orgId;
    const { examId, subjectId, marks } = req.body;

    if (!examId || !subjectId || !marks || !Array.isArray(marks)) {
      return res.status(400).json({ message: "Exam ID, Subject ID, and marks array are required" });
    }

    const updatePromises = marks.map(async (markData) => {
      const { studentId, marksObtained, remarks } = markData;

      return supabase
        .from("marks")
        .update({
          marks_obtained: marksObtained,
          remarks: remarks || null,
          status: "entered"
        })
        .eq("org_id", orgId)
        .eq("exam_id", examId)
        .eq("subject_id", subjectId)
        .eq("student_id", studentId);
    });

    const results = await Promise.all(updatePromises);
    
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Error updating marks:", errors);
      return res.status(500).json({ message: "Failed to update some marks" });
    }

    res.json({ success: true, updated: marks.length });
  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;