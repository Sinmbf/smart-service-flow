export const queryKeys = {
  auth: {
    me: ["auth", "me"],
  },

  tokens: {
    active: ["tokens", "active"],
    detail: (id) => ["tokens", "detail", id],
  },

  services: {
    list: ({ search = "", page = 1, pageSize = 20, lang = "en" } = {}) => [
      "services",
      "list",
      {
        search: search.trim(),
        page,
        pageSize,
        lang,
      },
    ],

    detail: (id) => ["services", "detail", id],
  },
};
