import { ObjectId } from "mongodb";
import { dbName, getClient, uri } from "./db_client";
import { Page as IPage } from "../models/page";

const client = getClient();

export default class Page {

    private db = client.db(dbName);
    private collection = this.db.collection('pages');

    constructor() {
        client.connect();
    }

    async insert(data: any) {
        const result = await this.collection.insertOne({ ...data, created: new Date(), updated: new Date() });
        return result.insertedId;
    }

    async get(id: string): Promise<IPage> {
        const page = await this.collection.findOne({ _id: new ObjectId(id) });
        return page as any as IPage;
    }

    async getAll(documentationId?: string): Promise<IPage[]> {
        const query = documentationId ? { documentationId } : {};
        const pages = await this.collection.find(query).toArray();
        return pages as any as IPage[];
    }

    async update(id: string, data: any) {
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: data.title,
                    url: data.url,
                    documentationId: data.documentationId,
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