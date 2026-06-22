export type Flashcard = {
  id: string;
  front: string;
  back: string;
  hint: string;
  tag: string;
};

export type FlashcardDeck = {
  id: string;
  taskId: string;
  taskTitle: string;
  title: string;
  createdAt: string;
  source: { noteCharacters: number; commentCount: number };
  cards: Flashcard[];
};
