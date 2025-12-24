const validBookIds = [620, 621, 644, 645, 646, 648, 651, 654];

jest.mock('../adapters/bookservice.adapter', () => ({
    BookServiceAdapter: {
        existsByBookId: jest.fn(async (id: number) => validBookIds.includes(id))
    },
}));

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { BookReviewModel } from '../schema/review.model';
import { BookRatingModel } from '../schema/bookrating.model';

let mongod: MongoMemoryServer;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

describe("Review API Integration", () => {
    describe("POST /api/review", () => {
        it("should create a review and update book rating", async () => {
            const reviewPayload = { bookId: 620, rating: 5, comment: "Excellent!" };

            const res = await request(app)
                .post("/api/review")
                .send(reviewPayload)
                .expect(200);

            expect(res.body).toMatchObject({
                success: true,
                message: "OK",
                data: {
                    bookId: 620,
                    rating: 5,
                    comment: "Excellent!"
                }
            });

            const ratingDoc = await BookRatingModel.findOne({ bookId: 620 }).lean();
            expect(ratingDoc?.reviewCount).toBe(1);
            expect(ratingDoc?.averageRating).toBe(5);
        });

        it("should fail for invalid rating", async () => {
            const reviewPayload = { bookId: 620, rating: 6 };

            const res = await request(app)
                .post("/api/review")
                .send(reviewPayload)
                .expect(400);

            expect(res.body.message).toBe("Validation failed");
        });

        it("should fail for non-existent bookId", async () => {
            const reviewPayload = { bookId: 999, rating: 4 };

            const res = await request(app)
                .post("/api/review")
                .send(reviewPayload)
                .expect(404);

            expect(res.body.message).toBe("Book with the submitted bookId wasn't found on the backend");
        });
    });

    // GET /api/review
    it("should return paginated reviews with rating info", async () => {
        await BookReviewModel.insertMany([
            { bookId: 621, rating: 4, comment: "Good" },
            { bookId: 621, rating: 3, comment: "Average" }
        ]);
        await BookRatingModel.create({ bookId: 621, reviewCount: 2, ratingSum: 7, averageRating: 3.5 });

        const res = await request(app)
            .get("/api/review")
            .query({ bookId: 621, limit: 1 })
            .expect(200);

        expect(res.body.data.reviews).toHaveLength(1);
        expect(res.body.data.nextCursor).toBeTruthy();
        expect(res.body.data.rating).toEqual({ reviewCount: 2, averageRating: 3.5 });
    });

    // GET all reviews
    it("should return all reviews if no limit specified", async () => {
        await BookReviewModel.insertMany([
            { bookId: 644, rating: 5, comment: "Great" },
            { bookId: 644, rating: 2, comment: "Bad" }
        ]);
        await BookRatingModel.create({ bookId: 644, reviewCount: 2, ratingSum: 7, averageRating: 3.5 });

        const res = await request(app)
            .get("/api/review")
            .query({ bookId: 644 })
            .expect(200);

        expect(res.body.data.reviews).toHaveLength(2);
        expect(res.body.data.nextCursor).toBeNull();
        expect(res.body.data.rating).toEqual({ reviewCount: 2, averageRating: 3.5 });
    });

    // POST /api/review/_counts
    describe("POST /api/review/_counts", () => {
        it("should return review counts for multiple books", async () => {
            // Insert reviews directly into MongoDB
            await BookReviewModel.insertMany([
                { bookId: 620, rating: 5 },
                { bookId: 620, rating: 4 },
                { bookId: 621, rating: 3 }
            ]);

            // Call the API
            const res = await request(app)
                .post("/api/review/_counts")
                .send({ bookIds: validBookIds })
                .expect(200);

            // Expect the response to contain counts based on the inserted reviews
            // The response structure should match what your API actually returns
            // Usually it's in res.body.data or res.body depending on your controller
            expect(res.body.data).toEqual([
                { bookId: 620, count: 2 },
                { bookId: 621, count: 1 },
                { bookId: 644, count: 0 },
                { bookId: 645, count: 0 },
                { bookId: 646, count: 0 },
                { bookId: 648, count: 0 },
                { bookId: 651, count: 0 },
                { bookId: 654, count: 0 }
            ]);
        });
    });
});
