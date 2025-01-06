import { ObjectId } from "mongodb";
import { dbName, getClient, uri } from "./db_client";
import { Annotation } from "../models/annotation";
import { AnnotationFilters } from "../filters/annotation_filters";

const client = getClient();

export default class AnnotationDB {

    private db = client.db(dbName);
    private collection = this.db.collection('annotations');

    constructor() {
        client.connect();
    }

    async insert(data: Annotation) {
        if (!this.validateData(data)) {
            throw new Error("Invalid data");
        }
        const result = await this.collection.insertOne({
            ...data,
            documentationId: new ObjectId(data.documentationId),
            created: new Date(),
            updated: new Date(),
        });
        return result.insertedId;
    }

    private validateData(data: Annotation) {
        if (!data.value || !data.target || !data.url || !data.documentationId) {
            return false;
        }
        return true;
    }

    async get(id: string): Promise<Annotation> {
        const annotation = await this.collection
            .findOne({ _id: new ObjectId(id) });
        return this.mapToAnnotation(annotation);
    }

    async getAll(documentationId: string, filters?: AnnotationFilters): Promise<Annotation[]> {
        const query = { documentationId: new ObjectId(documentationId), ...filters };
        const annotatations = await this.collection.find(query).toArray();
        return annotatations.map(this.mapToAnnotation);
    }

    async update(id: string, data: Annotation) {
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
                    index: data.index,
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

    async deleteByDocumentationId(documentationId: string) {
        const result = await this.collection.deleteMany({ documentationId: new ObjectId(documentationId) });
        return result.deletedCount > 0;
    }

    private mapToAnnotation(data: any): Annotation {
        return {
            id: data._id.toString(),
            ...data,
        }
    }
}