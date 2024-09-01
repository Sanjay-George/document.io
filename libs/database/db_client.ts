import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

export const uri = `mongodb://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/`;
export const dbName = process.env.MONGO_DB;


const client = new MongoClient(uri);
export const getClient = () => client;