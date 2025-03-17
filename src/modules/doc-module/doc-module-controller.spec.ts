import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { DocumentController } from "./controllers/doc.controller";
import { DocumentService } from "./services/doc.service";
import { DocumentEntitiy } from "./entities/document.entity";
import { UploadFileDto } from "./dtos/uploadFile.dto";
import { DocumentStatus } from "./enums/document-status.enum";

// Mock DocumentEntity
const mockDocument: DocumentEntitiy = {
  id: 1,
  filePath: "/path/to/document.pdf",
  createdAt: new Date(),
  updatedAt: new Date(),
  title: "Sample Document",
  description: "This is a sample document",
  status: DocumentStatus.PROCESSING,
  createdBy: "user123",
  isDeleted: false,
  beforeInsertActions: function() {
    this.isDeleted = false;
  },
};

// Mock Document Service
const mockDocumentService = {
  createDocument: jest.fn().mockResolvedValue(mockDocument),
  fetchAllDocuments: jest.fn().mockResolvedValue([mockDocument]),
  getDocumentById: jest.fn().mockResolvedValue(mockDocument),
  updateDocument: jest.fn().mockResolvedValue(mockDocument),
  deleteDocument: jest.fn().mockResolvedValue({ code: 204, message: "Document deleted successfully" }),
};

describe("DocumentController", () => {
  let documentController: DocumentController;
  let documentService: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    documentController = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
  });

  it("should be defined", () => {
    expect(documentController).toBeDefined();
  });

  describe("uploadDocument", () => {
    it("should upload a document and return created entity", async () => {
      const file = { path: "/uploads/document.pdf" } as Express.Multer.File;
      const body: UploadFileDto = { title: "new PDF", description: "A new PDF document", createdBy: "user123" };

      const result = await documentController.uploadDocument(file, body);

      expect(result).toEqual(mockDocument);
      expect(documentService.createDocument).toHaveBeenCalledWith({
        ...body,
        filePath: file.path,
      });
    });
  });

  describe("fetchAllDocuments", () => {
    it("should return an array of documents", async () => {
      const result = await documentController.fetchAllDocuments();

      expect(result).toEqual([mockDocument]);
      expect(documentService.fetchAllDocuments).toHaveBeenCalled();
    });
  });

  describe("fetchDocumentById", () => {
    it("should return a document by ID", async () => {
      const result = await documentController.fetchDocumentById(1);

      expect(result).toEqual(mockDocument);
      expect(documentService.getDocumentById).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if document is not found", async () => {
      jest.spyOn(documentService, "getDocumentById").mockRejectedValueOnce(new NotFoundException("Document not found"));

      await expect(documentController.fetchDocumentById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateDocument", () => {
    it("should update a document and return the updated entity", async () => {
      const updateData = { title: "Updated PDF" };

      const result = await documentController.updateDocument(updateData, 1);

      expect(result).toEqual(mockDocument);
      expect(documentService.updateDocument).toHaveBeenCalledWith(1, updateData);
    });

    it("should throw an error if update fails", async () => {
      jest.spyOn(documentService, "updateDocument").mockRejectedValueOnce(new Error("Update failed"));

      await expect(documentController.updateDocument({}, 1)).rejects.toThrow("Update failed");
    });
  });

  describe("deleteDocument", () => {
    it("should delete a document and return success message", async () => {
      const result = await documentController.deleteDocument(1);

      expect(result).toEqual({ code: 204, message: "Document deleted successfully" });
      expect(documentService.deleteDocument).toHaveBeenCalledWith(1);
    });

    it("should throw an error if delete fails", async () => {
      jest.spyOn(documentService, "deleteDocument").mockRejectedValueOnce(new Error("Delete failed"));

      await expect(documentController.deleteDocument(1)).rejects.toThrow("Delete failed");
    });
  });
});
