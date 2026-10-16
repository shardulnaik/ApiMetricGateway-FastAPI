import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import KeyList from './KeyList';
import ApiConsole from './ApiConsole';
import { getUserKeys, generateUserKey } from '../../services/keyService';

export default function UserDashboard() {
    const [keys, setKeys] = useState([]);
    const [selectedKey, setSelectedKey] = useState('');

    const fetchKeys = async () => {
        try {
            const res = await getUserKeys();
            setKeys(res.data);
            if (res.data.length > 0 && !selectedKey) {
                setSelectedKey(res.data[0].key);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateKey = async () => {
        try {
            const res = await generateUserKey();
            setSelectedKey(res.data.key);
            fetchKeys();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <KeyList keys={keys} onGenerateKey={handleGenerateKey} />
                <ApiConsole keys={keys} selectedKey={selectedKey} setSelectedKey={setSelectedKey} />
            </main>
        </div>
    );
}