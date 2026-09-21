/* =====================================================
   GGL ASSET TRACKER FRONTEND
===================================================== */


/*
 * IMPORTANT
 *
 * Replace this with your deployed Apps Script /exec URL.
 *
 * Example:
 *
 * https://script.google.com/macros/s/XXXXXXXX/exec
 */

const API_URL =
  'PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE';



/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
  'DOMContentLoaded',
  function () {

    setYear();

    const isAssetPage =
      document.body.classList.contains(
        'asset-page'
      );


    if (isAssetPage) {

      loadAssetPage();

    } else {

      initializeSearchPage();

      loadStats();
    }

  }
);



/* =====================================================
   YEAR
===================================================== */

function setYear() {

  const year =
    document.getElementById(
      'year'
    );

  if (year) {

    year.textContent =
      new Date().getFullYear();
  }
}



/* =====================================================
   SEARCH PAGE
===================================================== */

function initializeSearchPage() {

  const searchInput =
    document.getElementById(
      'searchInput'
    );

  const searchButton =
    document.getElementById(
      'searchButton'
    );


  if (!searchInput) return;


  searchButton.addEventListener(
    'click',
    function () {

      performSearch(
        searchInput.value
      );

    }
  );


  searchInput.addEventListener(
    'keydown',
    function (event) {

      if (
        event.key === 'Enter'
      ) {

        performSearch(
          searchInput.value
        );

      }

    }
  );

}



/* =====================================================
   PERFORM SEARCH
===================================================== */

async function performSearch(
  query
) {

  query =
    String(
      query || ''
    ).trim();


  if (!query) {

    showEmpty();

    return;
  }


  showLoading();


  try {

    const data =
      await apiGet(
        'search',
        {
          q: query
        }
      );


    if (
      !data.success
    ) {

      throw new Error(
        data.error ||
        'Search failed.'
      );
    }


    renderSearchResults(
      data.results || []
    );

  }
  catch (error) {

    showError(
      error.message
    );

  }

}



/* =====================================================
   SEARCH RESULTS
===================================================== */

function renderSearchResults(
  assets
) {

  hideElement(
    'loading'
  );

  hideElement(
    'emptyMessage'
  );

  hideElement(
    'errorMessage'
  );


  const grid =
    document.getElementById(
      'resultsGrid'
    );


  grid.innerHTML =
    '';


  const resultCount =
    document.getElementById(
      'resultCount'
    );


  resultCount.textContent =
    `${assets.length} result${assets.length === 1 ? '' : 's'}`;


  if (
    assets.length === 0
  ) {

    grid.innerHTML = `

      <div class="message-card">

        <div class="empty-icon">
          ◇
        </div>

        <h3>
          No matching assets
        </h3>

        <p>
          No asset records matched your search.
        </p>

      </div>

    `;

    return;
  }


  assets.forEach(
    function(asset) {

      grid.appendChild(
        createAssetCard(
          asset
        )
      );

    }
  );

}



/* =====================================================
   ASSET CARD
===================================================== */

function createAssetCard(
  asset
) {

  const card =
    document.createElement(
      'a'
    );


  const assetNo =
    asset['Asset No'] ||
    'Unknown';


  card.href =
    `./gglassettracker.html?asset=${encodeURIComponent(assetNo)}`;


  card.className =
    'asset-card';


  const status =
    asset['Status'] ||
    'Unknown';


  card.innerHTML = `

    <div class="asset-card-top">

      <span class="asset-card-number">
        ${escapeHTML(assetNo)}
      </span>

      <span class="mini-status ${statusClass(status)}">
        ${escapeHTML(status)}
      </span>

    </div>


    <h3>
      ${escapeHTML(
        asset['Brand'] ||
        asset['Model'] ||
        asset['Asset Type'] ||
        'Asset'
      )}
    </h3>


    <div class="asset-card-model">
      ${escapeHTML(
        asset['Model'] ||
        asset['Asset Type'] ||
        '—'
      )}
    </div>


    <div class="asset-card-info">

      <div>

        <span>
          Serial No
        </span>

        <strong>
          ${escapeHTML(
            asset['Serial No'] ||
            '—'
          )}
        </strong>

      </div>


      <div>

        <span>
          Location
        </span>

        <strong>
          ${escapeHTML(
            asset['Location'] ||
            '—'
          )}
        </strong>

      </div>


      <div>

        <span>
          User
        </span>

        <strong>
          ${escapeHTML(
            asset['Current User Name'] ||
            'Unassigned'
          )}
        </strong>

      </div>

    </div>


    <div class="asset-card-footer">

      <span>
        View Asset
      </span>

      <span class="arrow">
        →
      </span>

    </div>

  `;


  return card;
}



/* =====================================================
   LOAD STATS
===================================================== */

async function loadStats() {

  try {

    const data =
      await apiGet(
        'stats'
      );


    if (
      !data.success
    ) return;


    const stats =
      data.stats ||
      {};


    setText(
      'totalAssets',
      stats.total || 0
    );


    setText(
      'availableAssets',
      stats.status &&
      stats.status.Available
        ? stats.status.Available
        : 0
    );


    setText(
      'assignedAssets',
      stats.status &&
      stats.status.Assigned
        ? stats.status.Assigned
        : 0
    );


    const maintenance =
      stats.status &&
      (
        stats.status.Maintenance ||
        stats.status['Under Maintenance']
      );


    setText(
      'maintenanceAssets',
      maintenance || 0
    );

  }
  catch (error) {

    console.error(
      'Stats error:',
      error
    );

  }

}



/* =====================================================
   ASSET DETAIL PAGE
===================================================== */

async function loadAssetPage() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const assetNo =
    params.get(
      'asset'
    );


  if (!assetNo) {

    showAssetError(
      'No Asset No was provided in the URL.'
    );

    return;
  }


  try {

    const data =
      await apiGet(
        'getAsset',
        {
          asset: assetNo
        }
      );


    if (
      !data.success
    ) {

      throw new Error(
        data.error ||
        'Asset not found.'
      );
    }


    renderAsset(
      data.asset
    );

  }
  catch (error) {

    showAssetError(
      error.message
    );

  }

}



/* =====================================================
   RENDER ASSET
===================================================== */

function renderAsset(
  asset
) {

  hideElement(
    'assetLoading'
  );

  hideElement(
    'assetError'
  );

  showElement(
    'assetContent'
  );


  const assetNo =
    asset['Asset No'] ||
    'Unknown';


  setText(
    'assetNumber',
    assetNo
  );


  setText(
    'qrAssetNumber',
    assetNo
  );


  setText(
    'assetDescription',

    [
      asset['Brand'],
      asset['Model'],
      asset['Asset Type']
    ]
      .filter(Boolean)
      .join(' • ') ||
      'Company Asset'
  );


  const status =
    asset['Status'] ||
    'Unknown';


  const statusElement =
    document.getElementById(
      'assetStatus'
    );


  statusElement.textContent =
    status;


  statusElement.className =
    `status-badge ${statusClass(status)}`;


  const qr =
    document.getElementById(
      'assetQR'
    );


  qr.src =
    asset['QR Image'] ||
    asset.qrImage ||
    '';


  renderAssetDetails(
    asset
  );


  renderAssignment(
    asset.assignment
  );


  renderMaintenance(
    asset.maintenance || []
  );


  renderTransfers(
    asset.transfers || []
  );


  renderAudits(
    asset.audits || []
  );


  renderQuickStatus(
    asset
  );


  renderRecord(
    asset
  );

}



/* =====================================================
   ASSET DETAILS
===================================================== */

function renderAssetDetails(
  asset
) {

  const container =
    document.getElementById(
      'assetDetails'
    );


  const fields = [

    [
      'Asset No',
      asset['Asset No']
    ],

    [
      'Asset Type',
      asset['Asset Type']
    ],

    [
      'Category',
      asset['Category']
    ],

    [
      'Brand',
      asset['Brand']
    ],

    [
      'Model',
      asset['Model']
    ],

    [
      'Serial No',
      asset['Serial No']
    ],

    [
      'Purchase Date',
      formatDate(
        asset['Purchase Date']
      )
    ],

    [
      'Purchase Cost',
      asset['Purchase Cost']
    ],

    [
      'Warranty Until',
      formatDate(
        asset['Warranty Until']
      )
    ],

    [
      'Condition',
      asset['Condition']
    ],

    [
      'Status',
      asset['Status']
    ],

    [
      'Location',
      asset['Location']
    ],

    [
      'Department',
      asset['Department']
    ],

    [
      'Vendor',
      asset['Vendor']
    ],

    [
      'Invoice No',
      asset['Invoice No']
    ],

    [
      'AMC Status',
      asset['AMC Status']
    ]

  ];


  container.innerHTML =
    fields
      .map(
        function(item) {

          return detailItem(
            item[0],
            item[1]
          );

        }
      )
      .join('');

}



/* =====================================================
   ASSIGNMENT
===================================================== */

function renderAssignment(
  assignment
) {

  const container =
    document.getElementById(
      'assignmentDetails'
    );


  if (!assignment) {

    container.innerHTML = `

      <div class="no-record">
        This asset is currently not assigned.
      </div>

    `;

    return;
  }


  const fields = [

    [
      'Employee ID',
      assignment['Employee ID']
    ],

    [
      'Employee Name',
      assignment['Employee Name']
    ],

    [
      'Department',
      assignment['Department']
    ],

    [
      'Designation',
      assignment['Designation']
    ],

    [
      'Location',
      assignment['Location']
    ],

    [
      'Assigned Date',
      formatDate(
        assignment['Assigned Date']
      )
    ],

    [
      'Assignment Status',
      assignment['Status']
    ]

  ];


  container.innerHTML =
    fields
      .map(
        function(item) {

          return detailItem(
            item[0],
            item[1]
          );

        }
      )
      .join('');

}



/* =====================================================
   MAINTENANCE
===================================================== */

function renderMaintenance(
  records
) {

  const container =
    document.getElementById(
      'maintenanceList'
    );


  if (
    !records.length
  ) {

    container.innerHTML =
      emptyHistory(
        'No maintenance records found.'
      );

    return;
  }


  container.innerHTML =
    records
      .map(
        function(record) {

          return historyItem(

            record['Maintenance Type'] ||
            'Maintenance',

            record['Issue'] ||
            record['Description'] ||
            'No issue description',

            record['Status'],

            formatDate(
              record['Start Date']
            ),

            record['Vendor']

          );

        }
      )
      .join('');

}



/* =====================================================
   TRANSFERS
===================================================== */

function renderTransfers(
  records
) {

  const container =
    document.getElementById(
      'transferList'
    );


  if (
    !records.length
  ) {

    container.innerHTML =
      emptyHistory(
        'No transfer records found.'
      );

    return;
  }


  container.innerHTML =
    records
      .map(
        function(record) {

          const from =
            record['From User Name'] ||
            record['From Location'] ||
            '—';


          const to =
            record['To User Name'] ||
            record['To Location'] ||
            '—';


          return historyItem(

            'Asset Transfer',

            `${from} → ${to}`,

            record['Reason'],

            formatDate(
              record['Transfer Date']
            ),

            record['Approved By']
          );

        }
      )
      .join('');

}



/* =====================================================
   AUDITS
===================================================== */

function renderAudits(
  records
) {

  const container =
    document.getElementById(
      'auditList'
    );


  if (
    !records.length
  ) {

    container.innerHTML =
      emptyHistory(
        'No audit records found.'
      );

    return;
  }


  container.innerHTML =
    records
      .map(
        function(record) {

          return historyItem(

            'Asset Audit',

            record['Physical Status'] ||
            'Audit completed',

            record['Condition'],

            formatDate(
              record['Audit Date']
            ),

            record['Audited By']
          );

        }
      )
      .join('');

}



/* =====================================================
   QUICK STATUS
===================================================== */

function renderQuickStatus(
  asset
) {

  const container =
    document.getElementById(
      'quickStatus'
    );


  container.innerHTML = `

    <div class="quick-row">

      <span>
        Status
      </span>

      <strong class="${statusClass(asset['Status'])}">
        ${escapeHTML(asset['Status'] || '—')}
      </strong>

    </div>


    <div class="quick-row">

      <span>
        Condition
      </span>

      <strong>
        ${escapeHTML(asset['Condition'] || '—')}
      </strong>

    </div>


    <div class="quick-row">

      <span>
        Location
      </span>

      <strong>
        ${escapeHTML(asset['Location'] || '—')}
      </strong>

    </div>


    <div class="quick-row">

      <span>
        User
      </span>

      <strong>
        ${escapeHTML(asset['Current User Name'] || 'Unassigned')}
      </strong>

    </div>

  `;

}



/* =====================================================
   RECORD
===================================================== */

function renderRecord(
  asset
) {

  const container =
    document.getElementById(
      'recordDetails'
    );


  container.innerHTML = `

    <div class="record-row">

      <span>
        Created
      </span>

      <strong>
        ${escapeHTML(
          formatDate(
            asset['Created On']
          )
        )}
      </strong>

    </div>


    <div class="record-row">

      <span>
        Updated
      </span>

      <strong>
        ${escapeHTML(
          formatDate(
            asset['Updated On']
          )
        )}
      </strong>

    </div>


    <div class="record-row">

      <span>
        Created By
      </span>

      <strong>
        ${escapeHTML(
          asset['Created By'] ||
          '—'
        )}
      </strong>

    </div>

  `;

}



/* =====================================================
   API GET
===================================================== */

async function apiGet(
  action,
  params = {}
) {

  if (
    API_URL.includes(
      'PASTE_YOUR'
    )
  ) {

    throw new Error(
      'Apps Script API URL has not been configured in app.js.'
    );
  }


  const url =
    new URL(
      API_URL
    );


  url.searchParams.set(
    'action',
    action
  );


  Object.keys(
    params
  )
    .forEach(
      function(key) {

        if (
          params[key] !== undefined &&
          params[key] !== null
        ) {

          url.searchParams.set(
            key,
            params[key]
          );
        }

      }
    );


  const response =
    await fetch(
      url.toString(),
      {
        method:
          'GET',

        cache:
          'no-store'
      }
    );


  if (
    !response.ok
  ) {

    throw new Error(
      `API HTTP ${response.status}`
    );
  }


  return response.json();
}



/* =====================================================
   DETAIL ITEM
===================================================== */

function detailItem(
  label,
  value
) {

  return `

    <div class="detail-item">

      <span>
        ${escapeHTML(label)}
      </span>

      <strong>
        ${escapeHTML(
          value ||
          '—'
        )}
      </strong>

    </div>

  `;
}



/* =====================================================
   HISTORY ITEM
===================================================== */

function historyItem(
  title,
  description,
  status,
  date,
  extra
) {

  return `

    <div class="history-item">

      <div class="history-marker"></div>

      <div class="history-content">

        <div class="history-top">

          <strong>
            ${escapeHTML(title || 'Record')}
          </strong>

          <span>
            ${escapeHTML(date || '—')}
          </span>

        </div>

        <p>
          ${escapeHTML(description || '—')}
        </p>

        ${
          status
            ? `<span class="history-status">
                ${escapeHTML(status)}
               </span>`
            : ''
        }

        ${
          extra
            ? `<div class="history-extra">
                ${escapeHTML(extra)}
               </div>`
            : ''
        }

      </div>

    </div>

  `;
}



/* =====================================================
   EMPTY HISTORY
===================================================== */

function emptyHistory(
  message
) {

  return `

    <div class="no-record">

      ${escapeHTML(message)}

    </div>

  `;
}



/* =====================================================
   ASSET ERROR
===================================================== */

function showAssetError(
  message
) {

  hideElement(
    'assetLoading'
  );

  hideElement(
    'assetContent'
  );

  showElement(
    'assetError'
  );


  setText(
    'assetErrorText',
    message
  );

}



/* =====================================================
   GENERAL ERROR
===================================================== */

function showError(
  message
) {

  hideElement(
    'loading'
  );

  hideElement(
    'emptyMessage'
  );


  const element =
    document.getElementById(
      'errorMessage'
    );


  element.textContent =
    message;


  showElement(
    'errorMessage'
  );

}



/* =====================================================
   LOADING
===================================================== */

function showLoading() {

  hideElement(
    'emptyMessage'
  );

  hideElement(
    'errorMessage'
  );

  showElement(
    'loading'
  );

}



/* =====================================================
   EMPTY
===================================================== */

function showEmpty() {

  hideElement(
    'loading'
  );

  hideElement(
    'errorMessage'
  );

  hideElement(
    'resultsGrid'
  );

  showElement(
    'emptyMessage'
  );


  setText(
    'resultCount',
    '0 results'
  );

}



/* =====================================================
   HELPERS
===================================================== */

function showElement(
  id
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.classList.remove(
      'hidden'
    );
  }

}


function hideElement(
  id
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.classList.add(
      'hidden'
    );
  }

}


function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;
  }

}



/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(
  value
) {

  if (!value) return '—';


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(
      value
    );
  }


  return date.toLocaleDateString(
    'en-IN',
    {
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric'
    }
  );
}



/* =====================================================
   STATUS CLASS
===================================================== */

function statusClass(
  status
) {

  const value =
    String(
      status || ''
    )
      .toLowerCase();


  if (
    value.includes(
      'available'
    )
  ) {

    return 'status-available';
  }


  if (
    value.includes(
      'assigned'
    )
  ) {

    return 'status-assigned';
  }


  if (
    value.includes(
      'maintenance'
    ) ||
    value.includes(
      'repair'
    )
  ) {

    return 'status-maintenance';
  }


  if (
    value.includes(
      'disposed'
    )
  ) {

    return 'status-disposed';
  }


  return 'status-neutral';
}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
  value
) {

  return String(
    value ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}
