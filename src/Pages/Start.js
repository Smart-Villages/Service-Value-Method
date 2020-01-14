/**
 * Service Value Method:  Provide visual indications what services to focus on given a list of participants with their
 *                        choices and additional decision criteria.
 *
 * @license AGPL-3.0-or-later
 *
 * Copyright (C) 2020 Thiemo Müller
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import CSVReader from 'react-csv-reader';
import './Start.css';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Provide a short introduction text with instructions on how to use it along with an example table. Ask the user to
 * "upload" a CSV file. CSV is parsed locally, so not actually uploaded.
 * Data is parsed through a library and provided back to the parent component.
 */
class Start extends React.Component {
  /**
   * Default render() callback.
   *
   * @returns {*}
   */
  render() {
    return (
      <div className="App-Start">
        <h1>Step 1/3: Upload CSV file</h1>
        <h2>How to</h2>
        <ul>
          <li>Upload a *.csv file. To get the csv file, export it from Excel by using "Save as...". The csv file should have
            the following structure:</li>
          <li>Provide a header row with the names of the services that the participants of your focus group came up with/could
            choose from. We recommend using short labels for the names of the services to make the service map as readable as possible.
          </li>
          <li>Provide one row for each participant. The name of the participant (can be anonymised but must be unique) must be
            in the first column, then insert the number of counters they assigned to each service. If participants could only
            select Yes or No, put in a 1 (Yes) or 0 (No).
          </li>
          <li>In rows at the bottom, provide your Decision Criteria that you want to assess each service with respect to. Examples
            are "Ease of delivery" or "Near-term economic benefit" (as defined in Clements et al 2019). For each service, insert a
            number to rate the service. When ranking services according to a Decision Criterion, larger numbers are interpreted as better.
          </li>
          <li>Optional: To control the colour of the service bubbles, add an additional row titled 'Colour' and indicate with numbers
            which services should be the same colour. For example, if you held multiple focus groups you can use the colour of each
            service bubble to indicate how many of the groups suggested that service.
          </li>
        </ul>
        <h2>Example:</h2>
        <table>
          <thead>
          <tr>
            <th>Person</th>
            <th>Option 1</th>
            <th>Option 2</th>
            <th>Option 3</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <th>Participant A</th>
            <td>3</td>
            <td>0</td>
            <td>1</td>
          </tr>
          <tr>
            <th>Participant B</th>
            <td>2</td>
            <td>1</td>
            <td>1</td>
          </tr>
          <tr>
            <th>Participant C</th>
            <td>0</td>
            <td>1</td>
            <td>3</td>
          </tr>
          <tr>
            <th>Ease of delivery</th>
            <td>1</td>
            <td>1</td>
            <td>3</td>
          </tr>
          <tr>
            <th>Near-term economic benefit</th>
            <td>2</td>
            <td>1</td>
            <td>1</td>
          </tr>
          </tbody>
        </table>
        <h2>Get started:</h2>

        <div className="App-Upload">
          <div className="Background">Upload...</div>
          <CSVReader onFileLoaded={data => {
            data = data.filter(item => {
              return item.length>1 && item.filter(value => {
                return !!value
              }).length;
            });

            if(data.length<4) {
              alert("The file you uploaded doesn't contain enough data. It requires at least 4 rows.");
              return;
            }

            let headers = data[0];

            let result = [];

            let unknownValues = [];

            for(let i=1; i<data.length; i++) {
              let row = {
                name: data[i][0],
              };

              let n=1;

              for(; n<data[i].length; n++) {
                if(n===headers.length) {
                  alert("You are missing the "+n+"th header row. Please enter a name for this service.");
                  return;
                }

                if(headers[n]==="name") {
                  alert("A service can't be named 'name'.");
                  return;
                }

                let value = data[i][n];

                value = value.replace( /(,|\.)[0-9]+/, "");

                if(value==="x" || value.match(/^\s*$/)) {
                  value = 0;
                }
                else if(value.match(/^[0-9]+$/)) {
                  value = parseInt(value);
                }
                else {
                  unknownValues.push(value);
                  value = 0;
                }

                row[
                  headers[n]
                  ] = value;
              }

              for(; n<headers.length; n++) {
                row[
                  headers[n]
                  ] = 0;
              }

              result.push(row);
            }

            this.props.onDone({
              services: headers.slice(1),
              data: result,
            })
          }}/>
        </div>

        <p className="Copyright">
          Clements, A., Wheeler, S., Mohr, A., & McCulloch, M. (2019). The Service Value Method for Design of Energy Access Systems in the Global South. Proceedings of the IEEE, 107(9), 1941–1966. <a href="https://doi.org/10.1109/JPROC.2019.2901215">https://doi.org/10.1109/JPROC.2019.2901215</a>
        </p>

        <p className="Copyright">
          Software copyright &copy; 2020 Thiemo Müller. This is free software, licensed under the <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">AGPL-3.0-or-later</a>. You can view and download the source code <a href="https://github.com/Smart-Villages/Service-Value-Method">here</a>.
        </p>
      </div>
    );
  }
}

export default Start;
