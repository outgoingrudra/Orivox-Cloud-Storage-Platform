import prisma from "../../config/prisma.js";

export async function listTrash({
  userId,
  search,
  page,
  limit,
}) {
  const searchWhere = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  /*
    Only records explicitly moved to trash
    have isTrashed=true.

    Descendants hidden only because their
    ancestor is trashed do not appear separately.
  */

  const [folders, files] =
    await prisma.$transaction([
      prisma.folder.findMany({
        where: {
          userId,
          isTrashed: true,
          ...searchWhere,
        },

        select: {
          id: true,
          name: true,
          parentId: true,
          trashedAt: true,
          createdAt: true,
        },
      }),

      prisma.file.findMany({
        where: {
          userId,
          isTrashed: true,
          ...searchWhere,
        },

        select: {
          id: true,
          name: true,
          folderId: true,
          mimeType: true,
          size: true,
          trashedAt: true,
          createdAt: true,
        },
      }),
    ]);

  const folderItems =
    folders.map((folder) => ({
      type: "folder",
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      trashedAt: folder.trashedAt,
      createdAt: folder.createdAt,
    }));

  const fileItems =
    files.map((file) => ({
      type: "file",
      id: file.id,
      name: file.name,
      folderId: file.folderId,
      mimeType: file.mimeType,
      size: Number(file.size),
      trashedAt: file.trashedAt,
      createdAt: file.createdAt,
    }));

  const items = [
    ...folderItems,
    ...fileItems,
  ].sort((a, b) => {
    return (
      new Date(b.trashedAt) -
      new Date(a.trashedAt)
    );
  });

  const total = items.length;

  const start =
    (page - 1) * limit;

  const paginated =
    items.slice(
      start,
      start + limit
    );

  return {
    items: paginated,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(total / limit),

      hasNextPage:
        page * limit < total,

      hasPreviousPage:
        page > 1,
    },
  };
}