export interface Todo {
    _id: string;
    status: boolean;
    category: string;
    body: string;
    owner: string;
}
export type TodoStatusSelect  = 'complete' | 'incomplete';