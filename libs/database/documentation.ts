import { ObjectId } from 'mongodb';
import { dbName, getClient, uri } from './db_client';
import { Documentation as IDocument } from '../models/documentation';

const client = getClient();

export default class Documentation {
    private db = client.db(dbName);
    private collection = this.db.collection('documents');

    constructor() {
        client.connect();
    }

    async insert(data: IDocument) {
        const result = await this.collection.insertOne({ ...data, created: new Date(), updated: new Date() });
        return result.insertedId;
    }

    async get(id: string) {
        const document = await this.collection.findOne({ _id: new ObjectId(id) });
        return document;
    }

    async getAll(projectId?: string) {
        const query = projectId ? { project: projectId } : {};
        const documents = await this.collection.find(query).toArray();
        return documents;
    }

    async update(id: string, data: IDocument) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: data.title,
                    description: data.description,
                    project: data.project,
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