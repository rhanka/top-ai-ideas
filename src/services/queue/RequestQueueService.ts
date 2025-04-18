
export interface QueueTask<T> {
  id: string;
  execute: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
}

export class RequestQueueService<T> {
  private queue: QueueTask<T>[] = [];
  private running: Set<string> = new Set();
  private concurrency: number;
  private isProcessing: boolean = false;

  constructor(concurrency: number = 5) {
    this.concurrency = concurrency;
  }

  public setConcurrency(concurrency: number): void {
    this.concurrency = concurrency;
    // Trigger processing in case we can now handle more concurrent requests
    this.processQueue();
  }

  public enqueue(task: QueueTask<T>): void {
    this.queue.push(task);
    this.processQueue();
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getRunningCount(): number {
    return this.running.size;
  }

  public getTotalCount(): number {
    return this.queue.length + this.running.size;
  }

  private async processQueue(): Promise<void> {
    // Prevent multiple simultaneous queue processing
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Process as many items as we can based on concurrency
      while (this.queue.length > 0 && this.running.size < this.concurrency) {
        const task = this.queue.shift();
        if (!task) continue;
        
        // Add to running set
        this.running.add(task.id);
        
        // Notify task has started
        if (task.onStart) {
          task.onStart();
        }
        
        // Execute the task without awaiting to allow parallelism
        this.executeTask(task).catch(console.error);
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  private async executeTask(task: QueueTask<T>): Promise<void> {
    try {
      const result = await task.execute();
      if (task.onSuccess) {
        task.onSuccess(result);
      }
    } catch (error) {
      if (task.onError) {
        task.onError(error as Error);
      }
    } finally {
      // Remove from running set
      this.running.delete(task.id);
      
      // Continue processing the queue
      this.processQueue();
    }
  }
}
