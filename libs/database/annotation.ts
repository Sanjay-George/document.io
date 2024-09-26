import { ObjectId } from "mongodb";
import { dbName, getClient, uri } from "./db_client";
import { Annotation as IAnnotation } from "../models/annotation";
import { url } from "inspector";
import { AnnotationFilters } from "../entities/annotation_filters";

const client = getClient();

export default class Annotation {

    private db = client.db(dbName);
    private collection = this.db.collection('annotations');

    constructor() {
        client.connect();
    }

    async insert(data: IAnnotation) {
        if (!this.validateData(data)) {
            throw new Error("Invalid data");
        }
        const result = await this.collection.insertOne({
            ...data,
            pageId: new ObjectId(data.pageId),
            created: new Date(),
            updated: new Date()
        });
        return result.insertedId;
    }

    private validateData(data: IAnnotation) {
        if (!data.value || !data.target || !data.url || !data.pageId) {
            return false;
        }
        return true;
    }

    async get(id: string): Promise<IAnnotation> {
        const annotation = await this.collection
            .findOne({ _id: new ObjectId(id) });
        return annotation as any as IAnnotation;
    }

    async getAll(pageId: string, filters?: AnnotationFilters): Promise<IAnnotation[]> {
        const query = { pageId: new ObjectId(pageId), ...filters };
        const annotatations = await this.collection.find(query).toArray();
        return annotatations as any as IAnnotation[];
    }

    async update(id: string, data: any) {
        if (!this.validateData(data)) {
            throw new Error("Invalid data");
        }
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    value: data.value,
                    target: data.target,
                    url: data.url,
                    type: data.type,
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

    async deleteByPageId(pageId: string) {
        const result = await this.collection.deleteMany({ pageId: new ObjectId(pageId) });
        return result.deletedCount > 0;
    }

}