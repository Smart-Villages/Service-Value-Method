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
import './ResultWeb.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Chart from "react-apexcharts";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

/**
 * Render the actual result as a web / radar diagram. Allows the user to filter using the attributes he previously
 * defined to be decision criteria.
 */
class ResultWeb extends React.Component {
  /**
   * Initialize the state.
   *
   * @param props
   */
  constructor(props) {
    super(props);

    const criteria = [].concat(props.decisionCriteria).concat([
      props.bubbleSizes,
      Object.assign({name: "Sum of votes"}, props.serviceVotes),
    ]);

    this.state = {
      activeServices: props.selectedServices,
      criteria: criteria,
      criteriaMin: criteria.map(() => {
        return 0;
      }),
      criteriaMaxValues: criteria.map((row) => {
        const highestService = props.selectedServices.reduce((service1, service2) => {
          return row[service1] > row[service2] ? service1 : service2;
        });

        return row[highestService];
      }),
    };
  }

  /**
   * Default render() callback.
   *
   * @returns {*}
   */
  render() {
    const {
      criteria,
      criteriaMin,
      criteriaMaxValues,
      activeServices,
    } = this.state;

    const series = activeServices.map((service) => {
      return {
        name: service,
        data: criteria.map((criterion, i) => {
          return Math.round(criterion[service] / criteriaMaxValues[i] * 100);
        })
      };
    });

    const options = {
      // The default number of colors is too few
      colors: ['#FFCA66','#FF7396','#6B6CFF','#5AE6E8','#A9E85A','#FFEB69','#E8875D','#BF5DE8','#6393FF','#6FFF98'],
      chart: {
        height: 600,
        type: 'radar',
      },
      title: {
        text: series.length===1 ? series[0].name : ''
      },
      xaxis: {
        categories: criteria.map((criterion) => {
          return criterion.name;
        }),
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: {
          formatter: (value) => {
            return `${value}%`;
          },
        },
      }
    };

    return (
      <div className="App-Display">
        <div className="App-Display-Options">
          <a href="#back" onClick={(e) => {
            e.preventDefault();

            this.props.show("grid");
          }}>Back</a>
        </div>
        <div className="App-Display-Chart">
          { series.length ? (
            <Chart options={options} series={series} type="radar" height={600} />
            ) : (
              <em>No services map these criteria.</em>
          ) }
        </div>
        <div className="App-Display-Filters">
          {
            criteria.map((row, i) => {
              return (
                <Row>
                  <Col xs={4} className={"Row-Name"}>
                    <label htmlFor={`row-${i}`}>{row.name}</label>
                  </Col>
                  <Col xs={6} className={"Row-Value"}>
                    <input id={`row-${i}`} type="range" min="0" max={criteriaMaxValues[i]} value={criteriaMin[i]} onChange={(event) => {
                      criteriaMin[i] = event.target.value;
                      this.setState({
                        criteriaMin: criteriaMin,
                        activeServices: this.props.selectedServices.filter((service) => {
                          let keep = true;

                          criteria.forEach((row,i) => {
                            if(row[service]<criteriaMin[i]) {
                              keep = false;
                            }
                          });

                          return keep;
                        }),
                      });
                    }} />
                  </Col>
                  <Col xs={2} className={"Row-Max"}>
                    <strong>{criteriaMin[i]}</strong> / {criteriaMaxValues[i]}
                  </Col>
                </Row>
              );
            })
          }
        </div>
      </div>
    );
  }
}

export default ResultWeb;
