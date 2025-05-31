const linkMap = new Map([
   ['home', 'index.html'],
   ['about', 'about.html'],
   ['websites', 'websites.html'],
   ['videos', 'videos.html'],
   ['music', 'music.html'],
   ['piano', 'piano.html'],
   ['friends', 'friends.html'],
])

class SiteFooter extends HTMLElement {
   constructor() {
      super();
   }

   getCurrentLocation() {
      return document.location.href.split('/')?.reverse()?.[0] ?? 'index';
   }

   createLinkTable() {
      const linkTable = document.createElement('div');
      linkTable.classList.add('table');
      const currentLocation = this.getCurrentLocation();
      for (const [title, link] of linkMap.entries()) {
         const linkTableCell = document.createElement('div');
         linkTableCell.classList.add('cell');

         const linkTemplate = document.createElement('a');
         linkTemplate.href = link;
         linkTemplate.textContent = title;

         if (link.includes((currentLocation === '' ? 'index' : currentLocation))) {
            linkTableCell.classList.add('active')
         }

         linkTableCell.appendChild(linkTemplate);
         linkTable.appendChild(linkTableCell);
      }

      return linkTable;
   }

   createStyle() {
      const style = document.createElement('style');
      style.textContent = `
         div {
            border: 1px solid black;
         }

         .table {
            display: flex;
            flex-wrap: wrap;
            padding: 1px;
            width: fit-content;
         }

         .cell {
            padding: 1px;
            margin: 1px;
         }

         .cell.active {
            background: #ffffffc0;
            border-style: dashed;
         }

         .cell.active a {
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