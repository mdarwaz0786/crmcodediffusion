// Helper function to build the projection object based on user permissions
const buildProjection = (permissions, moduleName) => {
  if (!permissions[moduleName]) {
    throw new Error(`Permissions for module '${moduleName}' not found.`);
  };

  const moduleFields = permissions[moduleName].fields;
  const projection = {};

  for (const [key, value] of Object.entries(moduleFields)) {
    projection[key] = value.show ? 1 : 0;
  };

  // Ensure _id, createdAt, and updatedAt are included unless explicitly excluded
  if (projection._id !== 0) {
    projection._id = 1;
  };

  if (projection.createdAt !== 0) {
    projection.createdAt = 1;
  };

  if (projection.updatedAt !== 0) {
    projection.updatedAt = 1;
  };

  return projection;
};

export default buildProjection;
