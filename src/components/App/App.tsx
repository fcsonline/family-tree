import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash'
import ReactFamilyTree from 'react-family-tree';
import PinchZoomPan from '../PinchZoomPan/PinchZoomPan';
import FamilyNode from '../FamilyNode/FamilyNode';
import { Node, ExtNode } from 'relatives-tree/lib/types';
import { Member, ExtMember } from '../../types'

import computeMembers from '../../utils'

import styles from './App.module.css';

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz7IXuNUVIbhYCe8f-ERoYfpx4JZVGKijx6ksTc6NyJb9RbSjkMfgIitSg6gbsFA5UqK7UNg5bkFel/pub?gid=1970367138&single=true&output=csv'
const WIDTH = 200;
const HEIGHT = 120;

export default React.memo<{}>(
  function App() {
    const [error, setError] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);
    const [nodes, setNodes] = useState<Array<Member>>([]);

    const [highlightBirthdays, setHighlightBirthdays] = React.useState<boolean>(true)
    const [search, setSearch] = useState<string>('');
    const [defaultId, setDefaultId] = useState<string>('');
    const [rootId, setRootId] = useState<string>('');
    const onResetClick = useCallback(() => setRootId(defaultId), [defaultId]);

    useEffect(() => {

      async function compute() {
        const response = await fetch(url)

        if (response.ok) {
          const text = await response.text()
          const members: Array<Member> = await computeMembers(text)

          const annonymous = members.map((member, index) => _.pickBy({
            ...member,
            // name: `Member #${index}`,
            from: null,
            birthday: null,
            deathday: null,
            image: null
          }, _.identity))

          console.log(members)
          console.log(annonymous)

          setNodes(members)
          setRootId(members[0].id)
          setDefaultId(members[0].id)
        } else {
          setError(true)
        }

        setFetching(false)
      }

      compute()
    }, [])

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e && e.target.value)
    }

    const onHighlightBirthdays = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHighlightBirthdays(e && e.target.checked)
    }

    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.emoji} role="img" aria-label="Arbre">
             🌳
            </span>
            Arbre Genealògic
          </h1>
          <div className={styles.searcher}>
            <span className={styles.emoji} role="img" aria-label="Cercar">
             🔍
            </span>
            Cercar: <input type="text" value={search} onChange={onSearch} />
          </div>
          <div className={styles.searcher}>
            <span className={styles.emoji} role="img" aria-label="Aniversaris">
             🎂
            </span>
            Destacar pròxims aniversaris: <input type="checkbox" defaultChecked={highlightBirthdays} onChange={onHighlightBirthdays} />
          </div>
          <span className={styles.description}>
            Arbre Genealògic amb tots els avantpassats coneguts de la nostra familia
          </span>
        </header>
        {error && (
          <div className={styles.error}>
            Error fetching data!
          </div>
        )}
        {!error && fetching && (
          <div className={styles.loading}>
            Loading...
          </div>
        )}
        {nodes && rootId && (
          <PinchZoomPan
            min={0.5}
            max={2.5}
            captureWheel
            className={styles.wrapper}
          >
            <ReactFamilyTree
              nodes={nodes as Node[]}
              rootId={rootId}
              width={WIDTH}
              height={HEIGHT}
              className={styles.tree}
              renderNode={(node: ExtNode) => (
                <FamilyNode
                  key={node.id}
                  node={node as ExtMember}
                  isRoot={node.id === rootId}
                  search={search}
                  highlightBirthday={highlightBirthdays}
                  onSubClick={setRootId}
                  onClick={setRootId}
                  style={{
                    width: WIDTH,
                    height: HEIGHT,
                    transform: `translate(${node.left * (WIDTH / 2)}px, ${node.top * (HEIGHT / 2)}px)`,
                  }}
                />
              )}
            />
          </PinchZoomPan>
        )}
        {rootId !== defaultId && (
          <div className={styles.reset} onClick={onResetClick}>
            Reset
          </div>
        )}
      </div>
    );
  }
);
