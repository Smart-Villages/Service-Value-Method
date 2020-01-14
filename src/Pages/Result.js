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
import './Result.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import {RATING_TYPE_BETTER_WORSE, RATING_TYPE_EASIER_HARDER, RATING_TYPE_LOWER_HIGHER} from "../Constants";

/**
 * Render the actual result. We're using SVG to render the diagram so it's scalable (good for print) and can be saved to
 * an image file easily.
 * The user can select what decision criterion to use for drawing which axis.
 * Provides a `Download` button for the user to download the graphic that's currently shown.
 * Note that this component renders an inline `<style>` element within the `<svg>` so that it's included when saving /
 * downloading the SVG.
 *
 * The color of the bubbles is decided based on the row the user marked to provide the `importance`:
 * - If none is given or only one value, everything is drawn green.
 * - If two values are given, the lower is red and the higher is green.
 * - If three values are given and the values are equally close to one another, the lowest is red, the middle is orange
 *   and the highest is green.
 * - Otherwise the color will be calculated to be within a gradient going from red (0%) to orange (50%) to green (100%).
 */
class Result extends React.Component {
  /**
   * Initialize the state.
   *
   * @param props
   */
  constructor(props) {
    super(props);

    this.state = {
      criterionXIndex: 0,
      criterionYIndex: 1,
    };
  }

  /**
   * Default render() callback.
   *
   * @returns {*}
   */
  render() {
    const options = [];

    const {
      decisionCriteria,
      serviceVotes,
      serviceVoters,
      selectedServices,
      bubbleSizes
    } = this.props;

    const {
      criterionXIndex,
      criterionYIndex,
    } = this.state;

    const criterionX = decisionCriteria[criterionXIndex];
    const criterionY = decisionCriteria[criterionYIndex];

    for(let x=0; x<decisionCriteria.length; x++) {
      for(let y=0; y<decisionCriteria.length; y++) {
        if(x===y) {
          continue;
        }

        options.push({
          x: x,
          y: y,
          name: `${decisionCriteria[x].name} vs. ${decisionCriteria[y].name}`
        });
      }
    }

    let highestX = 0;
    let highestY = 0;
    let highestVotes = 0;
    selectedServices.forEach(service => {
      if(criterionX[service]>highestX) {
        highestX = criterionX[service];
      }
      if(criterionY[service]>highestY) {
        highestY = criterionY[service];
      }
      if(serviceVotes[service]>highestVotes) {
        highestVotes = serviceVotes[service];
      }
    });

    const quadrants = [];
    for(let x=0; x<=highestX; x++) {
      const column = [];
      for(let y=0; y<=highestY; y++) {
        column.push([]);
      }
      quadrants.push(column);
    }

    let maxServicesInQuadrant = 0;
    selectedServices.forEach(service => {
      const x = criterionX[service];
      const y = criterionY[service];
      quadrants[x][y].push(service);

      if(quadrants[x][y].length>maxServicesInQuadrant) {
        maxServicesInQuadrant = quadrants[x][y].length;
      }
    });

    let biggestAxisSizeWithinQuadrant = 1;
    while(Math.pow(biggestAxisSizeWithinQuadrant,2)<maxServicesInQuadrant) {
      biggestAxisSizeWithinQuadrant++;
    }



    const START_COLOR = 0xa83232;
    const MIDDLE_COLOR = 0xd9a218;
    const END_COLOR = 0x32a852;

    const numberToRGB = no => {
      const rNumber = Math.round( (no & 0xFF0000) / 65536);
      const gNumber = Math.round( (no & 0x00FF00) / 256);
      const bNumber = Math.round( (no & 0x0000FF));

      return [
        rNumber,
        gNumber,
        bNumber
      ];
    };

    const rgbToColorString = rgb => {
      const r = rgb[0]<16 ? '0' + rgb[0].toString(16) : rgb[0].toString(16);
      const g = rgb[1]<16 ? '0' + rgb[1].toString(16) : rgb[1].toString(16);
      const b = rgb[2]<16 ? '0' + rgb[2].toString(16) : rgb[2].toString(16);

      return '#'+r+g+b;
    };

    const START_COLOR_RGB = numberToRGB(START_COLOR);
    const MIDDLE_COLOR_RGB = numberToRGB(MIDDLE_COLOR);
    const END_COLOR_RGB = numberToRGB(END_COLOR);
    const COLOR_DIFF1 = [
      MIDDLE_COLOR_RGB[0] - START_COLOR_RGB[0],
      MIDDLE_COLOR_RGB[1] - START_COLOR_RGB[1],
      MIDDLE_COLOR_RGB[2] - START_COLOR_RGB[2]
    ];
    const COLOR_DIFF2 = [
      END_COLOR_RGB[0] - MIDDLE_COLOR_RGB[0],
      END_COLOR_RGB[1] - MIDDLE_COLOR_RGB[1],
      END_COLOR_RGB[2] - MIDDLE_COLOR_RGB[2]
    ];

    let useColorCoding = !!bubbleSizes;
    let minColor = Infinity;
    let maxColor = 0;
    if(useColorCoding) {
      selectedServices.forEach(service => {
        if(bubbleSizes[service]>maxColor) {
          maxColor = bubbleSizes[service];
        }
        if(bubbleSizes[service]<minColor) {
          minColor = bubbleSizes[service];
        }
      })
    }

    const getColorForPercent = percent => {
      let rgb;
      if(percent>0.5) {
        percent -= 0.5;
        percent *= 2;
        rgb = [
          Math.round( MIDDLE_COLOR_RGB[0] + COLOR_DIFF2[0] * percent ),
          Math.round( MIDDLE_COLOR_RGB[1] + COLOR_DIFF2[1] * percent ),
          Math.round( MIDDLE_COLOR_RGB[2] + COLOR_DIFF2[2] * percent )
        ];
      }
      else {
        percent *= 2;
        rgb = [
          Math.round( START_COLOR_RGB[0] + COLOR_DIFF1[0] * percent ),
          Math.round( START_COLOR_RGB[1] + COLOR_DIFF1[1] * percent ),
          Math.round( START_COLOR_RGB[2] + COLOR_DIFF1[2] * percent )
        ];
      }

      return rgbToColorString(rgb);
    };

    const getColor = service => {
      if(!serviceVotes[service]) {
        return '#000000';
      }

      if(!useColorCoding || maxColor===minColor) {
        return rgbToColorString(END_COLOR_RGB);
      }

      const size = bubbleSizes[service];
      let percent = (size - minColor) / (maxColor - minColor);

      return getColorForPercent(percent);
    };



    // We always draw in rectangular quadrants. We always fill 90% with the quadrants and use 10% to draw the axis.
    const AXIS_SIZE = 8;
    const ARROW_SIZE = 2;
    const AREA_SIZE = 90;
    const QUADRANT_SIZE = AREA_SIZE / (highestY>highestX ? highestY : highestX);

    const SERVICE_RECTANGLE_SIZE = QUADRANT_SIZE / biggestAxisSizeWithinQuadrant;
    // Use 10% for the name of the service below the circle
    const SERVICE_CIRCLE_MAX_SIZE = SERVICE_RECTANGLE_SIZE * 0.8;
    const SERVICE_TEXT_SIZE = SERVICE_RECTANGLE_SIZE - SERVICE_CIRCLE_MAX_SIZE;

    const EMPTY_QUADRANTS_Y = highestY>highestX ? 0 : highestX-highestY;
    const EMPTY_QUADRANTS_X = highestY>highestX ? highestY-highestX : 0;
    const BOTTOM = 100-EMPTY_QUADRANTS_Y*QUADRANT_SIZE;
    const RIGHT = 100-EMPTY_QUADRANTS_X*QUADRANT_SIZE;

    const getServiceCircleSize = service => {
      const votes = serviceVotes[service];

      const percent = votes / highestVotes;

      const size = SERVICE_CIRCLE_MAX_SIZE * percent;

      if(size<0.1) {
        return 0.1;
      }

      return size;
    };

    const LABELS = {
      [RATING_TYPE_BETTER_WORSE] : {
        LOW: "Worse",
        HIGH: "Better",
      },
      [RATING_TYPE_LOWER_HIGHER] : {
        LOW: "Lower",
        HIGH: "Higher",
      },
      [RATING_TYPE_EASIER_HARDER] : {
        LOW: "Harder",
        HIGH: "Easier",
      }
    };

    const LABELS_X = LABELS[criterionX._ratingType] ? LABELS[criterionX._ratingType] : LABELS[RATING_TYPE_BETTER_WORSE];
    const LABELS_Y = LABELS[criterionY._ratingType] ? LABELS[criterionY._ratingType] : LABELS[RATING_TYPE_BETTER_WORSE];

    return (
      <div className="App-Display">
        <div className="App-Display-Options">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Display
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {
                options.map(item => {
                  return (
                    <Dropdown.Item key={`compare-${item.x}-${item.y}`} onClick={event=> {
                      event.preventDefault();

                      this.setState({
                        criterionXIndex: item.x,
                        criterionYIndex: item.y
                      });
                    }}>{item.name}</Dropdown.Item>
                  );
                })
              }
            </Dropdown.Menu>
          </Dropdown>

          <Button variant={"primary"} onClick={(event)=> {
            event.preventDefault();

            const filename = 'download.svg';
            const doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
            const source = (new XMLSerializer()).serializeToString(this.svgElement);
            const url = window.URL.createObjectURL(new Blob([doctype+source], { "type" : "text/xml" }));

            const a = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute("class", "svg-download");
            a.setAttribute("download", filename);
            a.setAttribute("href", url);
            a.style["display"] = "none";
            a.click();

            setTimeout(function() {
              window.URL.revokeObjectURL(url);
            }, 10);
          }}>Download</Button>
        </div>
        <div className="App-Display-Chart">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${RIGHT} ${BOTTOM}`}
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className={`Horizontal-Number-Of-Items-${highestX*biggestAxisSizeWithinQuadrant}`}
            ref={el => this.svgElement = el}
          >
            <style type="text/css">
              {`
                line.Axis {
                  stroke:#000;
                  stroke-width:2;
                }
                path.Axis {
                  fill:#000;
                  stroke-width:0;
                }
                line.Grid {
                  stroke:#DDD;
                  stroke-width:1;
                }
                rect.Grid {
                  fill:rgba(50,168,82,.1);
                }

                text.Start {
                  text-anchor: start;
                }
                text.Middle {
                  text-anchor: middle;
                }
                text.End {
                  text-anchor: end;
                }

                text.ColorName {
                  font-weight:bold;
                }
              `}
            </style>
            {
              [[0,0],[-1,0],[-2,0],[0,1],[-1,1],[0,2]].map((v,i) => {
                return (
                  <rect
                    key={`grid-highlight-${i}`}
                    x={RIGHT-ARROW_SIZE+QUADRANT_SIZE*(v[0]-1)}
                    y={ARROW_SIZE+v[1]*QUADRANT_SIZE}
                    width={QUADRANT_SIZE}
                    height={QUADRANT_SIZE}
                    className={"Grid"}
                  />
                );
              })
            }

            <line x1={AXIS_SIZE} x2={RIGHT-ARROW_SIZE} y1={BOTTOM-AXIS_SIZE} y2={BOTTOM-AXIS_SIZE} className={"Axis"} vectorEffect="non-scaling-stroke" />
            <path d={`M${RIGHT-ARROW_SIZE},${BOTTOM-AXIS_SIZE-ARROW_SIZE/2} L ${RIGHT},${BOTTOM-AXIS_SIZE} ${RIGHT-ARROW_SIZE},${BOTTOM-AXIS_SIZE+ARROW_SIZE/2} Z`} className={"Axis"} vectorEffect="non-scaling-stroke"/>
            <text x={AXIS_SIZE+ARROW_SIZE} y={BOTTOM-AXIS_SIZE+2} className="Label X-Axis Start" fontSize="2" dy="0em">{LABELS_X.LOW}</text>
            <text x={RIGHT/2+AXIS_SIZE/2-ARROW_SIZE/2} y={BOTTOM-AXIS_SIZE+3} className="Label X-Axis Middle" fontSize="3" dy="0em">{criterionX.name}</text>
            <text x={RIGHT-ARROW_SIZE*2} y={BOTTOM-AXIS_SIZE+2} className="Label X-Axis End" fontSize="2" dy="0em">{LABELS_X.HIGH}</text>
            {
              Array.from({ length: highestY }, (v,i) => {
                const offset = (i+1) * QUADRANT_SIZE;

                return (
                  <line key={`grid-horizontal-${i}`} x1={AXIS_SIZE} x2={RIGHT-ARROW_SIZE} y1={BOTTOM-AXIS_SIZE-offset} y2={BOTTOM-AXIS_SIZE-offset} className={"Grid"} vectorEffect="non-scaling-stroke" />
                );
              })
            }

            <line x1={AXIS_SIZE} x2={AXIS_SIZE} y1={BOTTOM-AXIS_SIZE} y2={ARROW_SIZE} className={"Axis"} vectorEffect="non-scaling-stroke" />
            <path d={`M${AXIS_SIZE-ARROW_SIZE/2},${ARROW_SIZE} L ${AXIS_SIZE},0 ${AXIS_SIZE+ARROW_SIZE/2},${ARROW_SIZE} Z`} className={"Axis"} vectorEffect="non-scaling-stroke"/>
            <text x={-BOTTOM+AXIS_SIZE+ARROW_SIZE} y={AXIS_SIZE*0.9} className="Label Y-Axis Start" transform="rotate(-90)" fontSize="2" dy="0em">{LABELS_Y.LOW}</text>
            <text x={-BOTTOM/2+AXIS_SIZE/2-ARROW_SIZE/2} y={AXIS_SIZE*0.9} className="Label Y-Axis Middle" transform="rotate(-90)" fontSize="3" dy="0em">{criterionY.name}</text>
            <text x={-ARROW_SIZE*2} y={AXIS_SIZE*0.9} className="Label Y-Axis End" transform="rotate(-90)" fontSize="2" dy="0em">{LABELS_Y.HIGH}</text>
            {
              Array.from({ length: highestX }, (v,i) => {
                const offset = (i+1) * QUADRANT_SIZE;

                return (
                  <line key={`grid-vertical-${i}`} x1={AXIS_SIZE+offset} x2={AXIS_SIZE+offset} y1={BOTTOM-AXIS_SIZE} y2={ARROW_SIZE} className={"Grid"} vectorEffect="non-scaling-stroke" />
                );
              })
            }

            {
              useColorCoding && (
                <text x={RIGHT/2+AXIS_SIZE/2-ARROW_SIZE/2} y={BOTTOM-AXIS_SIZE+6} className="Label X-Axis End" fontSize="2" dy="0em">{bubbleSizes.name}:&nbsp;</text>
              )
            }
            {
              Array.from({ length: useColorCoding ? maxColor - minColor + 1 : 0 }, (v,i) => {
                const COLOR_RECT_SIZE = 2;

                const color = getColorForPercent(i / (maxColor - minColor));

                const right = RIGHT/2+AXIS_SIZE/2-ARROW_SIZE/2 + (i+1) * (COLOR_RECT_SIZE * 1.5);
                const bottom = BOTTOM-AXIS_SIZE+5.3;

                const title = `${bubbleSizes.name}: ${minColor+i}`;

                return (
                  <g key={`color-${i}`}>
                    <circle cx={right} cy={bottom} r={COLOR_RECT_SIZE/2} fill={color} className={"Color"} strokeWidth={1} stroke={'#000000'} vectorEffect="non-scaling-stroke" />
                    <text x={right} y={bottom+0.6} className="ColorName Middle" fill={'#FFFFFF'} fontSize="1.7" dy="0em">{minColor+i}</text>
                    <title>{title}</title>
                  </g>
                );
              })
            }

            {
              quadrants.map((column, x) => {
                // Used for calculating the position. Quadrants start at 0, not 1.
                x--;

                return column.map((cell, y) => {
                  // Used for calculating the position. Quadrants start at 0, not 1.
                  y--;

                  let currentAxisSizeWithinQuadrant = 1;
                  while(Math.pow(currentAxisSizeWithinQuadrant,2)<cell.length) {
                    currentAxisSizeWithinQuadrant++;
                  }

                  const CURRENT_NUMBER_OF_ROWS = Math.ceil(cell.length / currentAxisSizeWithinQuadrant);

                  const THIS_SERVICE_RECTANGLE_WIDTH = QUADRANT_SIZE / currentAxisSizeWithinQuadrant;
                  const THIS_SERVICE_RECTANGLE_HEIGHT = QUADRANT_SIZE / CURRENT_NUMBER_OF_ROWS;

                  return cell.map((service, i) => {
                    const alone  = cell.length === 1;

                    const color = getColor(service);
                    const size = getServiceCircleSize(service);

                    // Starting at bottom left, moving to the right, then up
                    const row = Math.floor(i / currentAxisSizeWithinQuadrant);
                    const col = i % currentAxisSizeWithinQuadrant;

                    let left, bottom, cx, cy;

                    if(alone) {
                      left = AXIS_SIZE + QUADRANT_SIZE * x;
                      bottom = BOTTOM - AXIS_SIZE - QUADRANT_SIZE * y;

                      cx = left + QUADRANT_SIZE / 2;
                      cy = bottom - QUADRANT_SIZE / 2;
                    }
                    else if(CURRENT_NUMBER_OF_ROWS===1) {
                      left = AXIS_SIZE + QUADRANT_SIZE * x + col * THIS_SERVICE_RECTANGLE_WIDTH;
                      bottom = BOTTOM - AXIS_SIZE - QUADRANT_SIZE * y;

                      cx = left + THIS_SERVICE_RECTANGLE_WIDTH / 2;
                      cy = bottom - QUADRANT_SIZE / 2;
                    }
                    else {
                      left = AXIS_SIZE + QUADRANT_SIZE * x + col * THIS_SERVICE_RECTANGLE_WIDTH;
                      bottom = BOTTOM - AXIS_SIZE - QUADRANT_SIZE * y - row * THIS_SERVICE_RECTANGLE_HEIGHT;

                      cx = left + THIS_SERVICE_RECTANGLE_WIDTH / 2;
                      cy = bottom - SERVICE_TEXT_SIZE - (THIS_SERVICE_RECTANGLE_HEIGHT-SERVICE_TEXT_SIZE) / 2;
                    }

                    let label = service.replace(/\s+/, " ").split(" ");
                    if(label.length>2) {
                      const LABEL_LENGTH_LIMIT = 20 / currentAxisSizeWithinQuadrant;
                      const words = label;
                      label = [];
                      let i = 0;
                      while(i<words.length) {
                        let length = 0;
                        let line = "";
                        while(i<words.length && (!length || length+words[i].length<LABEL_LENGTH_LIMIT)) {
                          length += words[i].length;
                          line += (line ? " " : "") + words[i];
                          i++;
                        }
                        label.push(line);
                      }
                    }

                    //console.log(service, x, y, i, color, size, row, col, left, bottom, cx, cy);

                    //const label = service.length > 6 ? service.substr(0,6) + "..." : service;

                    const votes = serviceVotes[service];
                    const voters = serviceVoters[service];
                    const importance = useColorCoding ? bubbleSizes[service] : 'not provided';
                    const title = `${service}\n\nVotes: ${votes} from ${voters} participants\n${bubbleSizes ? bubbleSizes.name : 'Importance'}: ${importance}\n${criterionX.name}: ${x}\n${criterionY.name}: ${y}`;

                    return (
                      <g key={`service-${x}-${y}-${i}`}>
                        <circle cx={cx} cy={cy} r={size/2} fill={color} strokeWidth={1} stroke={'#000000'} vectorEffect="non-scaling-stroke" />
                        <text x={cx} y={cy+size/2+SERVICE_TEXT_SIZE*1.2} className="Service Middle" fill={votes ? '#000000' : '#a83232'} fontSize="1.5" dy="0em">
                          {
                            label.map((text, i) => {
                              return (
                                <tspan x={cx} dy={`${i?1:0}em`}>{text}</tspan>
                              );
                            })
                          }
                        </text>
                        <title>{title}</title>
                      </g>
                    );
                  })
                })
              })
            }
          </svg>
        </div>
      </div>
    );
  }
}

export default Result;
