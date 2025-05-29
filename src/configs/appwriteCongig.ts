import { Client, Databases, Query, ID } from "appwrite";

// Initialize client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT);

// Create database interface
const databases = new Databases(client);

// Environment Variables
const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE;

const COLLECTION_POST_ID = import.meta.env.VITE_APPWRITE_COLLECTION_POST;
const COLLECTION_REACTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_REACTION;
const COLLECTION_COMMENT_ID = import.meta.env.VITE_APPWRITE_COLLECTION_COMMENT;

const COLLECTION_GROUP_ID = import.meta.env.VITE_APPWRITE_COLLECTION_GROUP; // ✅ New: Groups collection
const COLLECTION_GROUP_MSG_ID = import.meta.env.VITE_APPWRITE_COLLECTION_GROUP_MSG; // ✅ New: Group messages collection

export {
  client,
  databases,
  DB_ID,
  COLLECTION_POST_ID,
  COLLECTION_REACTION_ID,
  COLLECTION_COMMENT_ID,
  COLLECTION_GROUP_ID,        // ✅ Export group collection
  COLLECTION_GROUP_MSG_ID,    // ✅ Export group message collection
  Query,
  ID,
};
