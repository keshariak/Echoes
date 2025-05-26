import { Client, Databases, Query } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT);

const databases = new Databases(client);

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE;
const COLLECTION_POST_ID = import.meta.env.VITE_APPWRITE_COLLECTION_POST;
const COLLECTION_REACTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_REACTION;

export {client, databases, DB_ID, COLLECTION_POST_ID, COLLECTION_REACTION_ID , Query };