import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import KeyList from './KeyList';
import ApiConsole from './ApiConsole';
import { getUserKeys, generateUserKey } from '../../services/keyService';

export default function UserDashboard() {
    const [keys, setKeys] = useState([]);
    const [selectedKey, setSelectedKey] = useState('');
    const [showApiConsole, setShowApiConsole] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const fetchKeys = async () => {
        try {
            const res = await getUserKeys();
            setKeys(res.data);
            if (res.data.length > 0 && !selectedKey) {
                setSelectedKey(String(res.data.find((key) => key.is_active)?.id || ''));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateKey = async () => {
        setGenerating(true);
        const loaderTimer = setTimeout(() => setShowLoader(true), 1000);
        try {
            const res = await generateUserKey();
            setKeys((current) => [res.data, ...current]);
            setSelectedKey(String(res.data.id));
        } catch (err) {
            console.error(err);
        } finally {
            clearTimeout(loaderTimer);
            setShowLoader(false);
            setGenerating(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar onSectionToggle={() => setShowApiConsole((current) => !current)} sectionLabel={showApiConsole ? 'Keys' : 'Console'} />
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
                {showApiConsole ? (
                    <ApiConsole keys={keys} selectedKey={selectedKey} setSelectedKey={setSelectedKey} />
                ) : (
                    <><KeyList keys={keys} onGenerateKey={handleGenerateKey} generating={generating} />{showLoader && <div className="result-loading mt-3" role="status"><span /> Generating key...</div>}</>
                )}
            </main>
        </div>
    );
}
