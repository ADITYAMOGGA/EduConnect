// In-memory database for Replit environment
// This provides a simple storage solution without external dependencies

export interface InMemoryDB {
  users: Map<string, any>;
  students: Map<string, any>;
  exams: Map<string, any>;
  marks: Map<string, any>;
  subjects: Map<string, any>;
  sessions: Map<string, any>;
}

// Create in-memory database instance
const memoryDB: InMemoryDB = {
  users: new Map(),
  students: new Map(),
  exams: new Map(),
  marks: new Map(),
  subjects: new Map(),
  sessions: new Map(),
};

console.log("In-memory database initialized successfully");
console.log("Using memory storage for database operations");

export { memoryDB as db };