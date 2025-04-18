
export interface QueueTask<T> {
  id: string;
  execute: () => Promise<T>;
  name: string;
  retryCount?: number;
}

export class ParallelQueueService<T> {
  private queue: QueueTask<T>[] = [];
  private activeCount: number = 0;
  private concurrencyLimit: number;
  private maxRetryAttempts: number;
  private onStart?: (task: QueueTask<T>) => void;
  private onComplete?: (task: QueueTask<T>, result: T) => void;
  private onError?: (task: QueueTask<T>, error: Error) => void;
  private onQueueUpdate?: (queueLength: number, activeCount: number) => void;
  private failedTasks: QueueTask<T>[] = [];

  constructor(concurrencyLimit: number = 5, maxRetryAttempts: number = 3) {
    this.concurrencyLimit = concurrencyLimit;
    this.maxRetryAttempts = maxRetryAttempts;
  }

  setEventHandlers({
    onStart,
    onComplete,
    onError,
    onQueueUpdate,
  }: {
    onStart?: (task: QueueTask<T>) => void;
    onComplete?: (task: QueueTask<T>, result: T) => void;
    onError?: (task: QueueTask<T>, error: Error) => void;
    onQueueUpdate?: (queueLength: number, activeCount: number) => void;
  }) {
    this.onStart = onStart;
    this.onComplete = onComplete;
    this.onError = onError;
    this.onQueueUpdate = onQueueUpdate;
    return this;
  }

  setConcurrencyLimit(limit: number) {
    this.concurrencyLimit = limit;
    // Try to process more tasks if the limit was increased
    this.processQueue();
    return this;
  }
  
  setMaxRetryAttempts(attempts: number) {
    this.maxRetryAttempts = attempts;
    return this;
  }

  enqueue(task: QueueTask<T>): void {
    // Initialize retry count if not set
    if (task.retryCount === undefined) {
      task.retryCount = 0;
    }
    
    this.queue.push(task);
    
    if (this.onQueueUpdate) {
      this.onQueueUpdate(this.queue.length, this.activeCount);
    }
    
    // Try to process the task immediately if possible
    this.processQueue();
  }

  private async processQueue() {
    // If we're already at the concurrency limit or the queue is empty, don't do anything
    if (this.activeCount >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    // Take tasks from the queue up to the concurrency limit
    while (this.activeCount < this.concurrencyLimit && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.activeCount++;
      
      if (this.onQueueUpdate) {
        this.onQueueUpdate(this.queue.length, this.activeCount);
      }
      
      if (this.onStart) {
        this.onStart(task);
      }
      
      // Execute the task asynchronously
      this.executeTask(task).catch(console.error);
    }
  }

  private async executeTask(task: QueueTask<T>) {
    try {
      const result = await task.execute();
      
      if (this.onComplete) {
        this.onComplete(task, result);
      }
      
      return result;
    } catch (error) {
      // Check if we should retry
      if (task.retryCount !== undefined && task.retryCount < this.maxRetryAttempts) {
        console.log(`Retrying task "${task.name}" (Attempt ${task.retryCount + 1}/${this.maxRetryAttempts})`);
        task.retryCount++;
        // Re-queue the task
        this.enqueue(task);
      } else {
        // Max retries reached, mark as failed
        this.failedTasks.push(task);
        
        if (this.onError) {
          this.onError(task, error as Error);
        }
      }
      
      throw error;
    } finally {
      this.activeCount--;
      
      if (this.onQueueUpdate) {
        this.onQueueUpdate(this.queue.length, this.activeCount);
      }
      
      // Try to process more tasks from the queue
      this.processQueue();
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  getTotalCount(): number {
    return this.queue.length + this.activeCount;
  }
  
  getFailedTasks(): QueueTask<T>[] {
    return this.failedTasks;
  }
  
  clearFailedTasks(): void {
    this.failedTasks = [];
  }
}
