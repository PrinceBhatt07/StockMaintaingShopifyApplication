const BASE_URL = "https://apps.petriotics.com/api";

export const API_URL = {
  getRequest: `${BASE_URL}/get_requested_products`,
  getCustomers: `${BASE_URL}/get_customers`,
  addRequest: `${BASE_URL}/create-request`,
  archiveProducts: `${BASE_URL}/archive_product`,
  getArchivedProducts: `${BASE_URL}/get_archived_products`,
  getAvailableProducts: `${BASE_URL}/get_backInStock_products`,
  unArchiveProducts: `${BASE_URL}/unarchived_request`,
  getOutStockProducts: `${BASE_URL}/get_outstock_products`,
  editRequest: `${BASE_URL}/editRequest`,
  deleteRequest: `${BASE_URL}/delete-request`,
  bulkArchieve: `${BASE_URL}/bulk-action-for-archive`,
  bulkUnarchieve: `${BASE_URL}/bulk-action-for-unarchive`,
  bulkDelete: `${BASE_URL}/bulk-action-for-delete`,
  messageSent: `${BASE_URL}/message-sent`,
  editNotes: `${BASE_URL}/editNotes`,
};
