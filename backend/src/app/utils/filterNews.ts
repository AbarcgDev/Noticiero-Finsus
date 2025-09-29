import { Noticia } from "../models/Noticia";

export const filterNews = (noticias: Noticia[], censoredWords: string[]): Noticia[] => {
    return filterByCensor(
        filterByDate(noticias),
        censoredWords
    )
}

const filterByDate = (noticias: Noticia[]): Noticia[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 1);

    return noticias.filter(noticia => noticia.publicationDate >= sevenDaysAgo);
}

const filterByCensor = (noticias: Noticia[], censoredWords: string[]) => {
    return noticias.filter((noticia: Noticia) => {
        const title = noticia.title.toLowerCase();
        const body = noticia.content.toLowerCase();
        return !censoredWords.some((censoredWord) => {
            return title.includes(censoredWord.toLowerCase()) || body.includes(censoredWord.toLowerCase());
        });
    });
};