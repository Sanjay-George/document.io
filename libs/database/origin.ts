import { ObjectId } from "mongodb";
import { dbName, getClient, uri } from "./db_client";

const client = getClient();

export default class Origin {
    private db = client.db(dbName);
    private collection = this.db.collection('origins');

    constructor() {
        client.connect();
    }

    async insert(data: string) {
        const result = await this.collection.insertOne({
            origin: data,
        });
        return result.insertedId;
    }

    async getAll(): Promise<string[]> {
        const data = await this.collection.distinct('origin');
        return data as any as string[];
    }

    async update(id: string, data: string) {

        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    origin: data,
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