import { Request } from "express";

interface PaginationInput {
  page?: number;
  itemsPerPage?: number;
  sortOrder?: "asc" | "desc";
  sortField?: string | any;
}

interface PaginationOutput {
  page: number;
  skip: number;
  resultPerPage: number;
  sort: Record<string, number>;
}

export const paginationObject = (
  paginationObject: PaginationInput
): PaginationOutput => {
  const page = Number(paginationObject.page) || 1;
  const resultPerPage = Number(paginationObject.itemsPerPage) || 10;
  const skip = resultPerPage * (page - 1);
  const sortOrder = paginationObject.sortOrder === "asc" ? 1 : -1;
  const sortField = paginationObject.sortField?.trim()
    ? paginationObject.sortField
    : "createdAt";
  const sort: Record<string, number> = { [sortField]: sortOrder };
  return { page, skip, resultPerPage, sort };
};
