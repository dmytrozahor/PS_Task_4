## PS_Task_4

<p>This project features one of the applications developed under the guidance and mentoring during an internship at the company ProfItSoft, the winter fall 2025.</p>

### Objective
In this project we should use the capabilities of `NodeJS` and `TypeScript` on the one side and `Java` (with `Spring Framework`) on the other side ([PS-Task-2](https://github.com/dmytrozahor/PS_Task_2)) to develop a service for a book review management.

Optionally, we can implement the frontend part (implemented, see below)

![img.png](img/BE.png)
![FE.png](img/FE.png)

### Requirements
We should develop a separate `NodeJS` service, which shares Rest API for a `Review` entity. We should utilize `TypeScript` and use `MongoDB` as the DBMS. 

#### Endpoints Overview

| Endpoint                     | Description                                                                                                          | Technical Requirements                                                                                                                                                                                                              | Functional Requirements                                                                                                                                              |
|------------------------------|----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **POST /api/review**         | Creates a new Review record.                                                                                         | • Accept mandatory fields with their format and type<br>• Depending on subject domain, fields may be present in the record and automatically populated<br>• Must accept JSON object for the record<br>• Record must contain Book ID | • Validate that the corresponding Book object exists by querying the service<br>• Developed in Task 2                                                                |
| **GET /api/review**          | Returns a list of Review objects that belong to a single Book record, sorted by decreasing time (most recent first). | **Request Parameters:**<br>• `bookId` - Book ID (mandatory)<<br>• `size` - maximum number of objects to return in response<br>• `from` - element number from which selection will start                                             | • Retrieve all Review records associated with specified Book<br>• Apply pagination using size and from parameters<br>• Sort results by timestamp in descending order |
| **POST /api/review/_counts** | Accepts an array of Book IDs and returns Review counts                                                               | **Request Body:**<br> `{  "bookIds": [...]<br>}`                                                                                                                                                                                    | • Return total count of Review elements that belong to each of the Book elements<br>• Response example:<br>`{  "book1": 5, "book2": 2,"book3": 0}`                   |

#### Domain Model

- **Book** (Entity 1): Primary entity representing a book in the system
- **Review** (Entity 3): Secondary entity representing user reviews for books

## Notes

- All endpoints work with Review records which are related to Book records
- Book validation and service integration developed in Task 2
- Timestamp-based sorting ensures most recent reviews appear first
- The `_counts` endpoint is optimized for batch operations to retrieve review counts for multiple books in a single request

### Implementation

- The following structures were introduced: `BookRating`, `Review`, as well as all the corresponding DTOs.
- `Zod` library was used to maintain separation of architectural layers and to provide type-based validation.
- A clear structure was maintained to separate `dtos`, `middleware`, `routes`, `services` and `schema`.
- Integration tests were written for each endpoint.
- Additionally, the frontend was developed and introduced an additional functional, including update and delete operations.
- Additionally, was introduced `Docker` config for a comfortable deployment and `Datadog` (in progress) integration.

### Building the application
Use the task `npm run build` to build the application and deploy it with `npm run start` running the application from the root dir.

### Dependency diagrams (UMLs)
![UML.png](img/UML.png)
