import { ObjectId } from 'mongodb';
import { dbName, getClient, uri } from './db_client';
import { Project } from '../models/project';

const client = getClient();

export default class ProjectDB {
    private db = client.db(dbName);
    // TODO: update collection name
    private collection = this.db.collection('documents');

    constructor() {
        client.connect();
    }

    async insert(data: Project) {
        const result = await this.collection.insertOne({ ...data, created: new Date(), updated: new Date() });
        return result.insertedId;
    }

    async get(id: string) {
        const project = await this.collection.findOne({ _id: new ObjectId(id) });
        return project;
    }

    async getAll(projectId?: string) {
        const query = projectId ? { project: projectId } : {};
        const projects = await this.collection.find(query).toArray();
        return projects;
    }

    async update(id: string, data: Project) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    updated: new Date(),
                }
            }
        );
        return result.modifiedCount > 0;
    }

    async delete(id: string) {
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}