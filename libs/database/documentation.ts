import { ObjectId } from "mongodb";
import { dbName, getClient, uri } from "./db_client";
import { Documentation } from "../models/documentation";

const client = getClient();

export default class DocumentationDB {

    private db = client.db(dbName);
    // TODO: update collection name
    private collection = this.db.collection('pages');

    constructor() {
        client.connect();
    }

    async insert(data: Documentation) {
        const result = await this.collection.insertOne({
            ...data,
            projectId: new ObjectId(data.projectId),
            created: new Date(),
            updated: new Date()
        });
        return result.insertedId;
    }

    async get(id: string): Promise<Documentation> {
        const doc = await this.collection.findOne({ _id: new ObjectId(id) });
        return doc as any as Documentation;
    }

    async getAll(projectId: string): Promise<Documentation[]> {
        const query = { projectId: new ObjectId(projectId) };
        const docs = await this.collection.find(query).toArray();
        return docs as any as Documentation[];
    }

    async update(id: string, data: any) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: data.title,
                    url: data.url,
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