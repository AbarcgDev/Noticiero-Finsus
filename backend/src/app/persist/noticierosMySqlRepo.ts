import Noticiero, { NoticieroFields, NoticieroState } from "../models/Noticiero";
import { INoticierosRepository } from "./repository/INoticierosRepository";

class NoticieroMySqlRepository implements INoticierosRepository {
    constructor() { }

    async findAll(): Promise<Noticiero[]> {
        return await Noticiero.findAll({ order: [['publicationDate', 'DESC']] });
    }

    async findById(id: string): Promise<Noticiero | null> {
        return await Noticiero.findByPk(id);
    }

    async findPublished(): Promise<Noticiero[]> {
        return await Noticiero.findAll({
            where: { state: NoticieroState.PUBLISHED },
            order: [['publicationDate', 'DESC']]
        });
    }

    async findRejected(): Promise<Noticiero[]> {
        return await Noticiero.findAll({
            where: { state: NoticieroState.REJECTED },
            order: [['publicationDate', 'DESC']]
        });
    }

    async findPending(): Promise<Noticiero[]> {
        return await Noticiero.findAll({
            where: { state: NoticieroState.PENDING },
            order: [['publicationDate', 'ASC']]
        });
    }

    async create(noticieroData: Omit<NoticieroFields, 'id'>): Promise<Noticiero> {
        const noticiero = await Noticiero.create(noticieroData);
        return noticiero;
    }

    async update(id: string, channelData: Partial<NoticieroFields>): Promise<Noticiero | null> {
        const [affectedCount] = await Noticiero.update(channelData, { where: { id } });
        if (affectedCount > 0) {
            const updatedNoticiero = await Noticiero.findByPk(id);
            return updatedNoticiero;
        }
        return null;
    }

    async delete(id: string): Promise<boolean> {
        const deletedRowsCount = await Noticiero.destroy({ where: { id } });
        return deletedRowsCount > 0;
    }

    async activate(id: string): Promise<boolean> {
        const [affectedCount] = await Noticiero.update(
            { state: NoticieroState.PUBLISHED },
            { where: { id } }
        );
        return affectedCount > 0;
    }

    async deactivate(id: string): Promise<boolean> {
        const [affectedCount] = await Noticiero.update(
            { state: NoticieroState.REJECTED },
            { where: { id } }
        );
        return affectedCount > 0;
    }

}

export default NoticieroMySqlRepository;
