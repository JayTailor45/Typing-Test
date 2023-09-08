import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  getRandomParagraph(): Observable<string[]> {
    // Make the HTTP request to the specified URL with type: paragraph
    const url = 'https://codebeautify.org/randomData';

    // Create form data
    const formData = new FormData();
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*'
    });
    formData.append('type', 'paragraph');

    // Make the POST request
    return this.http.post<any>(url, formData,{headers:headers});
  }
  getRandomParagraphFormLocal():Observable<{ paragraphs: string[] }>{
     return this.http.get<any>('/assets/paragraph.json');
  }
}
