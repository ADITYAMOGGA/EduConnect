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

// ORGANIZATION SIGNUP - TEMPORARY FALLBACK APPROACH
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

    // For now, use the existing users table since RLS is blocking multi-org tables
    // This is a temporary solution until database permissions are fixed
    
    // Check if username already exists in existing users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("username")
      .eq("username", adminUsername)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create organization admin as a user with special role
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        username: adminUsername,
        email: email || `${adminUsername}@${orgName.toLowerCase().replace(/\s+/g, '')}.edu`,
        first_name: adminName.split(' ')[0] || adminName,
        last_name: adminName.split(' ').slice(1).join(' ') || '',
        school_name: orgName,
        password: passwordHash,
        role: 'org_admin',
        status: 'active'
      })
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      return res.status(500).json({ message: "Failed to create organization admin account" });
    }

    // Remove password from response
    const { password, ...userData } = newUser;

    res.status(201).json({ 
      user: userData,
      organization: {
        name: orgName,
        board_type: boardType,
        principal_name: principalName || adminName
      },
      message: "Organization admin account created successfully. Note: This is using a simplified setup until full multi-org schema is accessible." 
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

export default router;