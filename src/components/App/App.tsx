import React, { useState, useCallback, useEffect } from 'react';
// import nodes from '../../tree.json';
import ReactFamilyTree from 'react-family-tree';
import PinchZoomPan from '../PinchZoomPan/PinchZoomPan';
import FamilyNode from '../FamilyNode/FamilyNode';
import { IFamilyExtNode } from 'relatives-tree/lib/types';
import { IMember, IExtMember } from '../FamilyNode/FamilyNode';

import computeMembers from '../../utils'

import styles from './App.module.css';

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz7IXuNUVIbhYCe8f-ERoYfpx4JZVGKijx6ksTc6NyJb9RbSjkMfgIitSg6gbsFA5UqK7UNg5bkFel/pub?gid=1970367138&single=true&output=csv'
const WIDTH = 200;
const HEIGHT = 120;

export default React.memo<{}>(
  function App() {
    const [error, setError] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);
    const [nodes, setNodes] = useState<Object>([]);

    const [defaultId, setDefaultId] = useState<string>('');
    const [rootId, setRootId] = useState<string>('');
    const onResetClick = useCallback(() => setRootId(defaultId), [defaultId]);

    useEffect(() => {

      async function compute() {
        const response = await fetch(url)

        if (response.ok) {
          const text = await response.text()
          const members: Array<IMember> = await computeMembers(text)

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

    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span role="img" aria-label="Arbre">
             🌳
            </span>
            Arbre Genealògic
          </h1>
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
              nodes={nodes as IMember[]}
              rootId={rootId}
              width={WIDTH}
              height={HEIGHT}
              className={styles.tree}
              renderNode={(node: IFamilyExtNode) => (
                <FamilyNode
                  key={node.id}
                  node={node as IExtMember}
                  isRoot={node.id === rootId}
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
