import Database from 'sqlite3';
import { promisify } from 'util';

export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
}

class DatabaseManager {
  private db: Database.Database | null = null;

  async initialize() {
    return new Promise<void>((resolve, reject) => {
      this.db = new Database.Database('./agents.db', (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Database connected successfully');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  private async createTables() {
    const createAgentsTable = `
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        color TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        model TEXT NOT NULL,
        temperature REAL DEFAULT 0.7,
        max_tokens INTEGER DEFAULT 1000,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(createAgentsTable, (err) => {
        if (err) {
          console.error('Error creating agents table:', err);
          reject(err);
        } else {
          console.log('Agents table created successfully');
          resolve();
        }
      });
    });
  }

  async getAllAgents(): Promise<CustomAgent[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(
        `SELECT 
          id, name, description, icon, category, color,
          system_prompt as systemPrompt, model, temperature, max_tokens as maxTokens,
          created_at as createdAt, updated_at as updatedAt
         FROM agents 
         ORDER BY created_at DESC`,
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as CustomAgent[]);
          }
        }
      );
    });
  }

  async getAgentById(id: string): Promise<CustomAgent | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(
        `SELECT 
          id, name, description, icon, category, color,
          system_prompt as systemPrompt, model, temperature, max_tokens as maxTokens,
          created_at as createdAt, updated_at as updatedAt
         FROM agents 
         WHERE id = ?`,
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as CustomAgent || null);
          }
        }
      );
    });
  }

  async createAgent(agent: Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        `INSERT INTO agents (
          id, name, description, icon, category, color,
          system_prompt, model, temperature, max_tokens
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          agent.name,
          agent.description,
          agent.icon,
          agent.category,
          agent.color,
          agent.systemPrompt,
          agent.model,
          agent.temperature,
          agent.maxTokens
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(id);
          }
        }
      );
    });
  }

  async updateAgent(id: string, agent: Partial<Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(agent)) {
      if (value !== undefined) {
        // Convert camelCase to snake_case for database
        const dbKey = key === 'systemPrompt' ? 'system_prompt' : 
                     key === 'maxTokens' ? 'max_tokens' : key;
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return Promise.resolve();
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        `UPDATE agents SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteAgent(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM agents WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

export const dbManager = new DatabaseManager(); 