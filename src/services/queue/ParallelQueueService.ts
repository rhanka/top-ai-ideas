
export interface QueueTask<T> {
  id: string;
  execute: () => Promise<T>;
  name: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface QueueStats {
  totalTasks: number;
  successCount: number;
  failureCount: number;
  activeCount: number;
  pendingCount: number;
}

export class ParallelQueueService<T> {
  private queue: QueueTask<T>[] = [];
  private activeCount: number = 0;
  private concurrencyLimit: number;
  private maxRetries: number;
  private successCount: number = 0;
  private failureCount: number = 0;
  private totalTasksCount: number = 0;
  
  private onStart?: (task: QueueTask<T>) => void;
  private onComplete?: (task: QueueTask<T>, result: T) => void;
  private onError?: (task: QueueTask<T>, error: Error, willRetry: boolean) => void;
  private onQueueUpdate?: (queueLength: number, activeCount: number) => void;
  private onQueueComplete?: (stats: QueueStats) => void;

  constructor(concurrencyLimit: number = 5, maxRetries: number = 3) {
    this.concurrencyLimit = concurrencyLimit;
    this.maxRetries = maxRetries;
  }

  setEventHandlers({
    onStart,
    onComplete,
    onError,
    onQueueUpdate,
    onQueueComplete,
  }: {
    onStart?: (task: QueueTask<T>) => void;
    onComplete?: (task: QueueTask<T>, result: T) => void;
    onError?: (task: QueueTask<T>, error: Error, willRetry: boolean) => void;
    onQueueUpdate?: (queueLength: number, activeCount: number) => void;
    onQueueComplete?: (stats: QueueStats) => void;
  }) {
    this.onStart = onStart;
    this.onComplete = onComplete;
    this.onError = onError;
    this.onQueueUpdate = onQueueUpdate;
    this.onQueueComplete = onQueueComplete;
    return this;
  }

  setConcurrencyLimit(limit: number) {
    this.concurrencyLimit = limit;
    // Try to process more tasks if the limit was increased
    this.processQueue();
    return this;
  }

  setMaxRetries(limit: number) {
    this.maxRetries = limit;
    return this;
  }

  resetStats() {
    this.successCount = 0;
    this.failureCount = 0;
    this.totalTasksCount = 0;
  }

  enqueue(task: QueueTask<T>): void {
    // Initialize retry count if not provided
    const taskWithRetries = {
      ...task,
      retryCount: task.retryCount || 0,
      maxRetries: task.maxRetries !== undefined ? task.maxRetries : this.maxRetries
    };
    
    this.queue.push(taskWithRetries);
    this.totalTasksCount++;
    
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
      
      this.successCount++;
      
      if (this.onComplete) {
        this.onComplete(task, result);
      }
      
      return result;
    } catch (error) {
      const shouldRetry = task.retryCount < (task.maxRetries || this.maxRetries);
      
      if (this.onError) {
        this.onError(task, error as Error, shouldRetry);
      }
      
      // If we should retry, put the task back in the queue
      if (shouldRetry) {
        const retryTask = {
          ...task,
          retryCount: (task.retryCount || 0) + 1
        };
        
        // Re-enqueue with incremented retry count
        this.queue.push(retryTask);
      } else {
        // If we shouldn't retry, count as a failure
        this.failureCount++;
      }
      
      throw error;
    } finally {
      this.activeCount--;
      
      if (this.onQueueUpdate) {
        this.onQueueUpdate(this.queue.length, this.activeCount);
      }
      
      // Check if the queue is complete (no active tasks and no pending tasks)
      if (this.activeCount === 0 && this.queue.length === 0) {
        if (this.onQueueComplete) {
          const stats: QueueStats = {
            totalTasks: this.totalTasksCount,
            successCount: this.successCount,
            failureCount: this.failureCount,
            activeCount: this.activeCount,
            pendingCount: this.queue.length
          };
          this.onQueueComplete(stats);
        }
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
  
  getSuccessCount(): number {
    return this.successCount;
  }
  
  getFailureCount(): number {
    return this.failureCount;
  }
}
