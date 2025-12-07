// URL Converter for Blog Content
// Use this to convert your old MinIO URLs to new proxy URLs

const oldContent = `
![Screenshot 2025-12-05 at 7.38.16 pm.png](https://bucket-production-01b4.up.railway.app/portfolio/Screenshot 2025-12-05 at 7.38.16 pm.png) ![Screenshot 2025-12-05 at 7.38.45 pm.png](https://bucket-production-01b4.up.railway.app/portfolio/Screenshot 2025-12-05 at 7.38.45 pm.png)

![Screenshot 2025-12-05 at 10.13.00 pm.png](https://bucket-production-01b4.up.railway.app/portfolio/Screenshot 2025-12-05 at 10.13.00 pm.png)
`;

const newContent = oldContent.replace(
  /https:\/\/bucket-production-01b4\.up\.railway\.app\/portfolio\//g, 
  '/api/media-alt/'
);

console.log('OLD CONTENT:');
console.log(oldContent);
console.log('\n' + '='.repeat(50) + '\n');
console.log('NEW CONTENT:');
console.log(newContent);

// The converted content will be:
/*
![Screenshot 2025-12-05 at 7.38.16 pm.png](/api/media-alt/Screenshot 2025-12-05 at 7.38.16 pm.png) ![Screenshot 2025-12-05 at 7.38.45 pm.png](/api/media-alt/Screenshot 2025-12-05 at 7.38.45 pm.png)

![Screenshot 2025-12-05 at 10.13.00 pm.png](/api/media-alt/Screenshot 2025-12-05 at 10.13.00 pm.png)
*/