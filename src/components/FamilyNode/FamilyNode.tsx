import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { ExtMember } from '../../types'
import styles from './FamilyNode.module.css';
import { getYear, setYear, parse, differenceInDays } from 'date-fns'

interface Props {
  node: ExtMember;
  isRoot: boolean;
  search?: string,
  highlightBirthday: boolean,
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: React.CSSProperties;
}

const getImageUrl = (image: string) => {
  const captures = (image || '').match(/https:\/\/drive.google.com\/file\/d\/(.*)\/view/)
  const imageId = captures && captures[1]

  if (!imageId) return ''

  return `https://drive.google.com/thumbnail?id=${imageId}`
}

export default React.memo<Props>(
  function FamilyNode({ node, isRoot, search, highlightBirthday, onClick, onSubClick, style }) {
    const isMatch = !!search && (new RegExp(_.escapeRegExp(search), 'i')).test(node.name)
    const dates = _.compact([node.birthday, node.deathday]).join(' - ')
    const imageSrc = getImageUrl(node.image)

    const date = parse(node.birthday, 'd/M/yyyy', new Date())
    const currentDate = setYear(date, getYear(new Date()))
    const days = differenceInDays(currentDate, new Date())
    const birthdayThisWeek = highlightBirthday && days >= 0 && days < 15 && !node.deathday

    if (true) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 220 190"
          style={ { position: 'absolute', cursor: 'pointer', ...style}}
          onClick={() => { onClick(node.id) }}
        >
          <style>
            {`
            .name {
              fill: #333;
              font-weight: bold;
              white-space: nowrap;
              margin: 0px;
            }

            .from {
              fill: #666;
              margin: 0px;
            }

            .date {
              fill: #888;
              margin: 0px;
            }

            .age {
              fill: #333;
              margin-left: 2px;
            }
            `}
          </style>

          <defs>
            {imageSrc && (
              <pattern id={node.id} x="0%" y="0%" height="100%" width="100%" viewBox="0 0 70 70">
                <image x="0%" y="0%" width="70" height="70" xlinkHref={imageSrc}></image>
              </pattern>
            )}
            {!imageSrc && (
              <pattern id={node.id} x="0%" y="0%" height="100%" width="100%" viewBox="0 0 20 20">
                <rect width="20" height="20" fill="white" />
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </pattern>
            )}
          </defs>

          <circle className="medium" cx="110" cy="92" r="35" fill={ `url(#${node.id})` } stroke="lightblue" strokeWidth="2" />

          <text x="110" y="155" textAnchor="middle" className="name">{node.name || '-'}</text>
          <text x="110" y="180" textAnchor="middle" className="from">{node.from || '-'}</text>
          <text x="110" y="205" textAnchor="middle" className="date">
            {dates}
            {node.age && node.deathday && `(${node.age})`}
          </text>
        </svg>
      )
    }

    return (
      <div
        className={classNames(
          styles.root,
          birthdayThisWeek && styles.birthday,
          isMatch && styles.match
        )}
        style={style}
        onClick={() => { onClick(node.id) }}
      >
        <div
          className={classNames(
            styles.inner,
            styles[node.gender],
            isRoot && styles.isRoot,
          )}
        >
          {imageSrc && (
            <img className={styles.image} src={imageSrc} alt={node.name} title={node.name} />
          )}
          {!imageSrc && (
            <div className={styles.anonymous}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <p className={styles.name}>{node.name || '-'}</p>

          <p className={styles.from}>{node.from || '-'}</p>

          <p className={styles.date}>
            {dates}
            {node.age && node.deathday && (
              <span className={styles.age}>({node.age})</span>
            )}
          </p>
        </div>
      </div>
    );
  }
);
