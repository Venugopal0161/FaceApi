import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class IndexedDBService {
    private dbName = 'EmployeeDB1';
    private storeName = 'EmployeeRecords1';

    constructor() { }

    private openDatabase(): Promise<IDBDatabase> {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                store.createIndex('status', 'status', { unique: false });
            };
            request.onsuccess = (event: Event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event: Event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }


    async storeRecord(record: any) {
        const db = await this.openDatabase();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        return new Promise<void>((resolve, reject) => {
            store.add(record);
            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    async getAllRecords(): Promise<any[]> {
        const db = await this.openDatabase();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);

        return new Promise<any[]>((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = (event: Event) => {
                resolve((event.target as IDBRequest).result);
            };

            request.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }

    async deleteRecord(id: number): Promise<void> {
        const db = await this.openDatabase();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        return new Promise<void>((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = (event: Event) => {
                reject((event.target as IDBRequest).error);
            };
        });
    }
}
