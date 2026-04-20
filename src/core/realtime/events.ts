import { broadcast } from "../socket/socket.js";

type BaseRepo = {
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  delete: (id: string) => Promise<any>;
  list: () => Promise<any[]>;
  getById: (id: string) => Promise<any>;
};

export const withRealtime = <T extends BaseRepo>(repo: T, resource: string) => {
  return {
    ...repo,

    async create(data: any) {
      const item = await repo.create(data);

      broadcast(`${resource}:created`, item);

      return item;
    },

    async update(id: string, data: any) {
      const item = await repo.update(id, data);

      broadcast(`${resource}:updated`, item);

      return item;
    },

    async delete(id: string) {
      const item = await repo.delete(id);

      if (item) {
        broadcast(`${resource}:deleted`, { id });
      }

      return item;
    },
  };
};
