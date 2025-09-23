import Noticiero, { NoticieroFields } from "@/models/Noticiero";

export interface INoticierosRepository {
    findAll(): Promise<Noticiero[]>;
    findById(id: string): Promise<Noticiero | null>;
    findPending(): Promise<Noticiero[]>;
    findPublished(): Promise<Noticiero[]>;
    findRejected(): Promise<Noticiero[]>;
    create(noticieroData: Omit<NoticieroFields, 'id'>): Promise<Noticiero>;
    update(id: string, channelData: Partial<NoticieroFields>): Promise<Noticiero | null>;
    delete(id: string): Promise<boolean>;
    activate(id: string): Promise<boolean>;
    deactivate(id: string): Promise<boolean>;
}
