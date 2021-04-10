import React, { useState, useCallback, useEffect } from 'react';
import ReactFamilyTree from 'react-family-tree';
import PinchZoomPan from '../PinchZoomPan/PinchZoomPan';
import FamilyNode from '../FamilyNode/FamilyNode';
import { Node, ExtNode } from 'relatives-tree/lib/types';
import { Member, ExtMember } from '../../types'

import { decrypt, computeMembers } from '../../utils'

import styles from './App.module.css';

const eurl = 'U2FsdGVkX186bIgFZtZlz05ejtdGVBx5NqCEaBf8euwiqUXeN5+tiZuQYOdlemNKBhLOItq42c2wOMWiiVgk8Ui9TGBOZ7NSYSKI0FSD/wxN4pmLk/WqwG9DzaYmDPavag3vPsUU3jYnvplxp8Ya4BKN5kzcIo7GIudPhLjshVeOXoftWuKj3mbtKwI7ORf9GlD72qC8mVA0aHy1fZrcGTeGBAV3UuzThH626WUaUDDWynZ94GlVfVdb9IlCvPA9'

const WIDTH = 190;
const HEIGHT = 220;

export default React.memo<{}>(
  function App() {
    const [passphrase, setPassphrase] = useState<string>(window.localStorage.getItem('passphrase') || '');
    const [error, setError] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);
    const [nodes, setNodes] = useState<Array<Member>>([]);

    const [highlightBirthdays, setHighlightBirthdays] = React.useState<boolean>(true)
    const [search, setSearch] = useState<string>('');
    const [defaultId, setDefaultId] = useState<string>('');
    const [rootId, setRootId] = useState<string>('');
    const onResetClick = useCallback(() => setRootId(defaultId), [defaultId]);

    const fetchMembers = async () => {
      const url = decrypt(eurl, passphrase)

      if (url.match(/https/)) {
        const response = await fetch(url)

        if (response.ok) {
          window.localStorage.setItem('passphrase', passphrase)

          const text = await response.text()
          const members: Array<Member> = await computeMembers(text)

          setNodes(members)
          setRootId(members[0].id)
          setDefaultId(members[0].id)
        } else {
          setPassphrase('')
          window.localStorage.removeItem('passphrase')
          setError(true)
        }
      } else {
        setPassphrase('')
        window.localStorage.removeItem('passphrase')
        setError(true)
      }

      setFetching(false)
    }

    useEffect(() => {
      if (!passphrase) {
        setPassphrase(prompt('Clau d\'accés:') || '')
      }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (passphrase) fetchMembers()
    }, [passphrase]) // eslint-disable-line react-hooks/exhaustive-deps

    const onFetchData = () => {
      setFetching(true)
      fetchMembers()
    }

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e && e.target.value)
    }

    const onHighlightBirthdays = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHighlightBirthdays(e && e.target.checked)
    }

    if (!passphrase) return null

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
          <div className={styles.searcher}>
            <button onClick={onFetchData}>
              <span className={styles.emoji} role="img" aria-label="Recarregar">
                🔁
              </span>
              Carregar de nou les dades
            </button>
          </div>
          <span className={styles.description}>
            Arbre Genealògic amb tots els avantpassats coneguts de la nostra familia
          </span>
        </header>
        {error && (
          <div className={styles.error}>
            Error carregant les dades!
          </div>
        )}
        {!error && fetching && (
          <div className={styles.loading}>
            Carregant...
          </div>
        )}
        {!fetching && nodes && rootId && (
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
