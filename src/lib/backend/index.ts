// In a real application, this file would read from local storage 
// to decide which data provider to export.
// For now, we are just using the mock provider.

import { mockAdapter } from './mock-adapter';

export const dataProvider = mockAdapter;
