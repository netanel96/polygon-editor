import { makeAutoObservable } from 'mobx';

export class EditorFeedbackStore {
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setError(message: string) {
    this.error = message;
  }

  clearError() {
    this.error = null;
  }
}
