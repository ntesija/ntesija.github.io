const linkMap = new Map([
   ['home', 'index.html'],
   ['about', 'about.html'],
   ['music', 'music.html'],
   ['piano', 'piano.html'],
   ['websites', 'websites.html'],
])

class SiteFooter extends HTMLElement {
   constructor() {
      super();
   }

   getCurrentLocation() {
      return document.location.href.split('/')?.reverse()?.[0] ?? '';
   }

   createLinkTable() {
      const linkTable = document.createElement('table');
      const linkTableRow = document.createElement('tr');
      linkTable.appendChild(linkTableRow);
      for (const [title, link] of linkMap.entries()) {
         const linkTableCell = document.createElement('td');
         const linkTemplate = document.createElement('a');
         linkTemplate.href = link;
         linkTemplate.textContent = title;

         if (link === this.getCurrentLocation()) {
            linkTableCell.classList.add('active')
         }

         linkTableCell.appendChild(linkTemplate);
         linkTableRow.appendChild(linkTableCell);
      }

      return linkTable;
   }

   createStyle() {
      const style = document.createElement('style');
      style.textContent = `
         table, tr, td {
            border: 1px solid black;
         }

         td.active {
            background: #ffffffc0;
            border-style: dashed;
         }

         td.active a {
            color: black;
         }
            
         footer {
            font-size: 24px;
         }`;
      return style;
   }

   connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });
      const template = document.createElement('footer');

      template.appendChild(this.createStyle());
      template.appendChild(this.createLinkTable());

      shadow.appendChild(template.cloneNode(true));
   }
}

customElements.define('site-footer', SiteFooter);