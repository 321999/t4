import React, { useState, useMemo, useEffect } from 'react';
// import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Upload, Download, TrendingUp, Phone, Users, Clock, Target, Settings } from 'lucide-react';

// Generate realistic dummy call center data
// const generateDummyData = () => {
//   const services = ['Sales', 'Support', 'Billing', 'Technical', 'Retention', 'Activation'];
//   const agents = ['Agent_001', 'Agent_002', 'Agent_003', 'Agent_004', 'Agent_005', 'Agent_006', 'Agent_007', 'Agent_008'];
//   const dispositions = ['ANSWERED', 'NO ANSWER', 'BUSY', 'VOICEMAIL', 'CONNECTED', 'DROPPED', 'CALLBACK REQUESTED'];
//   const intervals = ['00:00-01:00', '01:00-02:00', '02:00-03:00', '03:00-04:00', '04:00-05:00', 
//                      '05:00-06:00', '06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00',
//                      '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00',
//                      '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00',
//                      '20:00-21:00', '21:00-22:00', '22:00-23:00', '23:00-00:00'];
//   const dialerTypes = ['Progressive', 'Preview', 'Predictive', 'Manual'];
//   const hangupBy = ['Agent', 'Customer', 'System'];

//   const data = [];
//   const startDate = new Date('2024-01-01');

//   for (let i = 0; i < 500; i++) {
//     const dayOffset = Math.floor(Math.random() * 30);
//     const callDate = new Date(startDate);
//     callDate.setDate(callDate.getDate() + dayOffset);

//     const interval = intervals[Math.floor(Math.random() * intervals.length)];
//     const isAnswered = Math.random() > 0.25;
//     const talkDuration = isAnswered ? Math.floor(Math.random() * 600) + 60 : 0;
//     const holdDuration = isAnswered ? Math.floor(Math.random() * 120) : 0;
//     const wrapupDuration = isAnswered ? Math.floor(Math.random() * 90) + 10 : 0;
//     const ringDuration = Math.floor(Math.random() * 45) + 5;
//     const ivrDuration = Math.floor(Math.random() * 30) + 5;

//     data.push({
//       S_No: i + 1,
//       Date: callDate.toISOString().split('T')[0],
//       Interval: interval,
//       Call_Number: `CALL${String(i + 1).padStart(6, '0')}`,
//       Service: services[Math.floor(Math.random() * services.length)],
//       Agent: isAnswered ? agents[Math.floor(Math.random() * agents.length)] : 'N/A',
//       Login_Id: isAnswered ? `L${Math.floor(Math.random() * 100) + 1000}` : 'N/A',
//       Start_Time: `${callDate.toISOString().split('T')[0]} ${interval.split('-')[0]}`,
//       End_Time: `${callDate.toISOString().split('T')[0]} ${interval.split('-')[0]}`,
//       Extension: Math.floor(Math.random() * 9000) + 1000,
//       Dni: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
//       Cli: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
//       Deposition: isAnswered ? 'ANSWERED' : dispositions[Math.floor(Math.random() * (dispositions.length - 2)) + 1],
//       Lead_Id: `LD${Math.floor(Math.random() * 100000)}`,
//       call_remark: isAnswered ? 'Call completed successfully' : 'No answer',
//       Batch: `B${Math.floor(Math.random() * 20) + 1}`,
//       Dialer_Type: dialerTypes[Math.floor(Math.random() * dialerTypes.length)],
//       Duration: talkDuration + holdDuration + wrapupDuration + ringDuration + ivrDuration,
//       Ivr_Duration: ivrDuration,
//       Ring_Duration: ringDuration,
//       Talk_Duration: talkDuration,
//       Wrapup_Duration: wrapupDuration,
//       Hold_Duration: holdDuration,
//       Call_Status: isAnswered ? (Math.random() > 0.1 ? 'ANSWERED' : 'CONNECTED') : 'NO ANSWER',
//       Hangup_By: isAnswered ? hangupBy[Math.floor(Math.random() * hangupBy.length)] : 'System',
//       Child_CallNumbr: Math.random() > 0.8 ? `CALL${String(i + 1000).padStart(6, '0')}` : '',
//       Ivr_Terminal: `IVR_${Math.floor(Math.random() * 5) + 1}`,
//       called_DID: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
//       SalesServiceOption: Math.random() > 0.5 ? 'Option_1' : 'Option_2',
//       After_SalesServiceOption: Math.random() > 0.5 ? 'Yes' : 'No'
//     });
//   }

//   return data;
// };




const CallCenterDashboard = () => {
  const [activeTab, setActiveTab] = useState('kpis');
  const [uploadedData, setUploadedData] = useState(null);
  const [serviceLevelThreshold, setServiceLevelThreshold] = useState(20);
  const [showSettings, setShowSettings] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState([]);

  // initially kep it null handling the session id 
  const [sessionId, setSessionId] = useState(null);
  const [stats, setStats] = useState(null);

  const [hourlyConnectData, setHourlyConnectData] = useState([]);




  // const data = useMemo(() => uploadedData || generateDummyData(), [uploadedData]);

  const data = useMemo(() => uploadedData ?? [], [uploadedData]);


  // File upload handler
  //   const handleFileUpload = (event) => {
  //   const file = event.target.files[0];

  //   console.log(file);
  //   if (!file) return;

  //   // To read the uploaded file 
  //   const reader = new FileReader();
  //   console.log(reader);
  //   reader.onload = (e) => {
  //     try {
  //       const text = e.target.result;
  //       const lines = text.split('\n');
  //       const headers = lines[0].split(',').map(h => h.trim());
  //     //  data store in the usestate
  //       setCsvHeaders(headers);
  //       const parsedData = [];
  //       const parsedLongestCallDuration=0;
  //       // console.log()
  //       for (let i = 1; i < lines.length; i++) {
  //         if (!lines[i].trim()) continue;
  //         const values = lines[i].split(',');
  //         const row = {};
  //         headers.forEach((header, idx) => {
  //           row[header] = values[idx]?.trim() || '';
  //         });

  //         // Convert numeric fields
  //         ['Talk_Duration', 'Hold_Duration', 'Wrapup_Duration', 'Duration', 'Ring_Duration', 'Ivr_Duration'].forEach(field => {
  //           if (row[field]) row[field] = parseFloat(row[field]) || 0;
  //         });

  //         parsedData.push(row);
  //       }

  //       setUploadedData(parsedData);
  //       alert(`Successfully loaded ${parsedData.length} records!`);
  //     } catch (error) {
  //       alert('Error parsing CSV file. Please check the format.');
  //     }
  //   };
  //   reader.readAsText(file);
  // };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // ---------- 1️⃣ SEND FILE TO BACKEND ----------
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const result = await response.json();
      // Backend returns passrsed rows
      // alert(result.me)
      { console.log(result) }
      { console.log(result.message) }
      setUploadedData(result.data);
      setCsvHeaders(result.headers);
      // set the session id
      setSessionId(result.session_id);
      // alert(`Uploaded ${result.data.length} records`);
    } catch (error) {
      console.error(error);
      alert("Failed to upload CSV");
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    fetch(`http://localhost:8000/api/dashboard-stats?session_id=${sessionId}`)
      .then(res => res.json())
      .then(setStats);
  }, [sessionId]);


  // for hourly coonected hor not 
  useEffect(() => {
    if (!sessionId) return;
  fetch(`http://localhost:8000/api/daily-hourly-connect-status?session_id=${sessionId}`)
    .then(res => res.json())
    .then(data => setHourlyConnectData(data))
    .catch(err => console.error(err));
}, [sessionId]);


if (hourlyConnectData){
  console.log("hourly connected data");
  console.log( hourlyConnectData.hourly );
}

  // {console.log("Stats:", stats)}
  if (stats) {
    console.log("ye kpis ka " + stats.kpis);
    console.log(JSON.stringify(stats.agentPerformance, null, 2));
    console.log("ye displosition ka " + JSON.stringify(stats.dispositions, null, 2));
    console.log("services\n"+ JSON.stringify(stats.Services));
  }


// for the dispostion 
const totalDispositionCount = stats?.dispositions?.reduce(
  (sum, d) => sum + d.count,
  0
) || 0;


  // Calculate KPIs
  // const kpis = useMemo(() => {
  //   const totalCalls = data.length;
  //   const answeredCalls = data.filter(d => 
  //     d.ConnectStatus?.includes('ANSWER') || d.Call_Status?.includes('Connected')
  //   ).length;

  //   const answerRate = (answeredCalls / totalCalls) * 100;
  //   const abandonmentRate = 100 - answerRate;

  //   const answeredData = data.filter(d => d.Talk_Duration > 0);
  //   const avgTalkTime = answeredData.reduce((sum, d) => sum + (d.Talk_Duration || 0), 0) / (answeredData.length || 1);
  //   const avgHoldTime = answeredData.reduce((sum, d) => sum + (d.Hold_Duration || 0), 0) / (answeredData.length || 1);
  //   const avgWrapupTime = answeredData.reduce((sum, d) => sum + (d.Wrapup_Duration || 0), 0) / (answeredData.length || 1);
  //   const avgAHT = avgTalkTime + avgHoldTime + avgWrapupTime;

  //   const answeredIn20s = data.filter(d => 
  //     (d.Call_Status?.includes('ANSWER') || d.Call_Status?.includes('CONNECTED')) && 
  //     (d.Ring_Duration || 0) <= serviceLevelThreshold
  //   ).length;
  //   const serviceLevel = answeredCalls > 0 ? (answeredIn20s / answeredCalls) * 100 : 0;

  //   return {
  //     totalCalls,
  //     answeredCalls,
  //     notAnswered: totalCalls - answeredCalls,
  //     answerRate: answerRate.toFixed(1),
  //     abandonmentRate: abandonmentRate.toFixed(1),
  //     avgAHT: (avgAHT / 60).toFixed(1),
  //     avgTalkTime: (avgTalkTime / 60).toFixed(1),
  //     avgHoldTime: (avgHoldTime / 60).toFixed(1),
  //     avgWrapupTime: (avgWrapupTime / 60).toFixed(1),
  //     serviceLevel: serviceLevel.toFixed(1),
  //     avgRingTime: data.reduce((sum, d) => sum + (d.Ring_Duration || 0), 0) / totalCalls / 60
  //   };
  // }, [data, serviceLevelThreshold]);



  // Agent Performance with Top Dispositions
  // const agentPerformance = useMemo(() => {
  //   const agentMap = {};
  //   data.forEach(call => {
  //     if (call.Agent && call.Agent !== 'N/A') {
  //       if (!agentMap[call.Agent]) {
  //         agentMap[call.Agent] = { 
  //           agent: call.Agent, 
  //           total: 0, 
  //           answered: 0, 
  //           totalTalk: 0, 
  //           totalHold: 0,
  //           totalWrapup: 0,
  //           dispositions: {}
  //         };
  //       }
  //       agentMap[call.Agent].total++;
  //       if (call.Talk_Duration > 0) {
  //         agentMap[call.Agent].answered++;
  //         agentMap[call.Agent].totalTalk += call.Talk_Duration || 0;
  //         agentMap[call.Agent].totalHold += call.Hold_Duration || 0;
  //         agentMap[call.Agent].totalWrapup += call.Wrapup_Duration || 0;
  //       }
  //       const disp = call.Deposition || 'Unknown';
  //       agentMap[call.Agent].dispositions[disp] = (agentMap[call.Agent].dispositions[disp] || 0) + 1;
  //     }
  //   });

  //   return Object.values(agentMap).map(a => {
  //     const aht = a.answered > 0 ? (a.totalTalk + a.totalHold + a.totalWrapup) / a.answered : 0;
  //     const topDisp = Object.entries(a.dispositions).sort((x, y) => y[1] - x[1])[0];
  //     return {
  //       agent: a.agent,
  //       total: a.total,
  //       answered: a.answered,
  //       answerRate: ((a.answered / a.total) * 100).toFixed(1),
  //       avgAHT: (aht / 60).toFixed(1),
  //       topDisposition: topDisp ? `${topDisp[0]} (${topDisp[1]})` : 'N/A'
  //     };
  //   }).sort((a, b) => b.answered - a.answered);
  // }, [data]);

  // Disposition Distribution
  // const dispositionData = useMemo(() => {
  //   const dispMap = {};
  //   data.forEach(call => {
  //     const disp = call.Deposition || 'Unknown';
  //     dispMap[disp] = (dispMap[disp] || 0) + 1;
  //   });
  //   return Object.entries(dispMap)
  //     .map(([name, value]) => ({ name, value, percentage: ((value / data.length) * 100).toFixed(1) }))
  //     .sort((a, b) => b.value - a.value);
  // }, [data]);

  // Hourly Call Volume Heatmap Data
  const heatmapData = useMemo(() => {
    const heatMap = {};
    data.forEach(call => {
      const date = call.Date || 'Unknown';
      const hour = call.Interval ? call.Interval.split('-')[0].split(':')[0] : '00';
      const key = `${date}_${hour}`;
      heatMap[key] = (heatMap[key] || 0) + 1;
    });

    const uniqueDates = [...new Set(data.map(d => d.Date))].sort();
    const hours = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));

    const heatmapArray = [];
    uniqueDates.forEach(date => {
      hours.forEach(hour => {
        const key = `${date}_${hour}`;
        heatmapArray.push({
          date: date.slice(5),
          hour: `${hour}:00`,
          count: heatMap[key] || 0
        });
      });
    });

    return heatmapArray;
  }, [data]);

  // // Top Services/Campaigns
  // const topServices = useMemo(() => {
  //   const serviceMap = {};
  //   data.forEach(call => {
  //     const service = call.Service || 'Unknown';
  //     serviceMap[service] = (serviceMap[service] || 0) + 1;
  //   });
  //   return Object.entries(serviceMap)
  //     .map(([name, value]) => ({ name, value }))
  //     .sort((a, b) => b.value - a.value)
  //     .slice(0, 10);
  // }, [data]);

  // Dialer Type Comparison
  // const dialerComparison = useMemo(() => {
  //   const dialerMap = {};
  //   data.forEach(call => {
  //     const dialer = call.Dialer_Type || 'Unknown';
  //     if (!dialerMap[dialer]) {
  //       dialerMap[dialer] = { name: dialer, total: 0, answered: 0, totalAHT: 0, count: 0 };
  //     }
  //     dialerMap[dialer].total++;
  //     if (call.Talk_Duration > 0) {
  //       dialerMap[dialer].answered++;
  //       const aht = (call.Talk_Duration || 0) + (call.Hold_Duration || 0) + (call.Wrapup_Duration || 0);
  //       dialerMap[dialer].totalAHT += aht;
  //       dialerMap[dialer].count++;
  //     }
  //   });

  //   return Object.values(dialerMap).map(d => ({
  //     name: d.name,
  //     total: d.total,
  //     answered: d.answered,
  //     answerRate: ((d.answered / d.total) * 100).toFixed(1),
  //     avgAHT: d.count > 0 ? (d.totalAHT / d.count / 60).toFixed(1) : 0
  //   }));
  // }, [data]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

  const MetricCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
        </div>
        {Icon && <Icon size={40} style={{ color, opacity: 0.3 }} />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Upload */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 Call Center Analytics Dashboard</h1>
              <p className="text-blue-100">
                {uploadedData ? `Real data: ${stats && stats.totalCalls} calls` : `Demo data: ${stats && stats.totalCalls} calls`}
              </p>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold cursor-pointer hover:bg-blue-50 transition">
                <Upload size={20} />
                Upload CSV
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                <Settings size={20} />
                Settings
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="mt-4 p-4 bg-blue-700 rounded-lg">
              <label className="block text-sm font-medium mb-2">Service Level Threshold (seconds)</label>
              <input
                type="number"
                value={serviceLevelThreshold}
                onChange={(e) => setServiceLevelThreshold(parseInt(e.target.value) || 20)}
                className="px-4 py-2 rounded text-gray-800 w-32"
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        {console.log("kishore test")}

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            {['kpis', 'agents', 'trends', 'data'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize whitespace-nowrap ${activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                {tab === 'kpis' ? 'Call Center KPIs' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* CALL CENTER KPIs TAB */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            {/* Primary KPI Cards */}
            <div>
              <h2 className="text-2xl font-bold mb-4">📈 Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Calls"
                  value={stats && stats.kpis.totalCalls.toLocaleString()}
                  icon={Phone}
                  color="#0088FE"
                />
                <MetricCard
                  title="Answered Calls"
                  value={stats && stats.kpis.answeredCalls.toLocaleString()}
                  subtitle={`${stats && stats.kpis.notAnswered} not answered`}
                  icon={Phone}
                  color="#00C49F"
                />
                <MetricCard
                  title="Answer Rate"
                  value={`${stats && stats.kpis.answerRate}%`}
                  subtitle="Calls answered"
                  icon={Target}
                  color="#10B981"
                />
                <MetricCard
                  title="Abandonment Rate"
                  value={`${stats && stats.kpis.abandonmentRate}%`}
                  subtitle="Calls not answered"
                  icon={TrendingUp}
                  color="#EF4444"
                />
              </div>
            </div>

            {/* Secondary Metrics - Time Based */}
            <div>
              <h3 className="text-xl font-bold mb-4">⏱️ Time Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-500">
                  <p className="text-gray-500 text-sm font-medium">Avg AHT</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats && stats.kpis.avgAHT} min</p>
                  <p className="text-gray-600 text-xs mt-1">Average Handle Time</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
                  <p className="text-gray-500 text-sm font-medium">Avg Talk Time</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats && stats.kpis.avgTalkTime} min</p>
                  <p className="text-gray-600 text-xs mt-1">Conversation duration</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
                  <p className="text-gray-500 text-sm font-medium">Avg Hold Time</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats && stats.kpis.avgHoldTime} min</p>
                  <p className="text-gray-600 text-xs mt-1">Customer on hold</p>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-pink-500">
                  <p className="text-gray-500 text-sm font-medium">Avg Wrap-up Time</p>
                  <p className="text-3xl font-bold text-pink-600 mt-2">{stats && stats.kpis.avgWrapupTime} min</p>
                  <p className="text-gray-600 text-xs mt-1">Post-call work</p>
                </div>
              </div>
            </div>

            {/* Service Level */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">🎯 Service Level</h3>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-5xl font-bold text-green-600">{kpis.serviceLevel}%</p>
                  <p className="text-gray-600 mt-1">Calls answered within {serviceLevelThreshold} seconds</p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div 
                      className="bg-green-500 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ width: `${kpis.serviceLevel}%` }}
                    >
                      {kpis.serviceLevel}%
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Agent Performance Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">👥 Agent Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Agent</th>
                      <th className="px-4 py-3 text-right font-semibold">Total Calls</th>
                      <th className="px-4 py-3 text-right font-semibold">Answered</th>
                      <th className="px-4 py-3 text-right font-semibold">Answer Rate</th>
                      <th className="px-4 py-3 text-right font-semibold">Avg AHT (min)</th>
                      <th className="px-4 py-3 text-left font-semibold">Top Disposition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      stats && stats.agentPerformance.map((agent, idx) => {
                        const answerRate = agent.totalCalls
                          ? ((agent.answeredCalls / agent.totalCalls) * 100).toFixed(1)
                          : "0.0";

                        return (
                          <tr
                            key={agent.agent_name}
                            className={`${idx % 2 === 0 ? "bg-gray-50" : ""} hover:bg-blue-50`}
                          >
                            <td className="px-4 py-3 font-medium text-blue-700">
                              {agent.agent_name}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {agent.totalCalls}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold">
                              {agent.answeredCalls}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <span
                                className={`px-3 py-1 rounded-full font-semibold ${answerRate > 80
                                    ? "bg-green-100 text-green-800"
                                    : answerRate > 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {answerRate}%
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              {agent.avgAHT.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  {/* <tbody>
                    {agentPerformance.map((agent, idx) => (
                      <tr key={agent.agent} className={`${idx % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-blue-50`}>
                        <td className="px-4 py-3 font-medium text-blue-700">{agent.agent}</td>
                        <td className="px-4 py-3 text-right">{agent.total}</td>
                        <td className="px-4 py-3 text-right font-semibold">{agent.answered}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            parseFloat(agent.answerRate) > 80 ? 'bg-green-100 text-green-800' : 
                            parseFloat(agent.answerRate) > 60 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {agent.answerRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{agent.avgAHT}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{agent.topDisposition}</td>
                      </tr>
                    ))}
                  </tbody> */}
                </table>
              </div>
            </div>


            {/* disposition distribution */}
            {/* Disposition Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">📊 Disposition Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={stats?.dispositions}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      nameKey="value"
                      label={({ value, count }) =>
                        `${value}: ${((count / totalDispositionCount) * 100).toFixed(1)}%`
                      }
                    >
                      {stats?.dispositions?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>

                  {/* <PieChart>
                    <Pie
                      data={stats && stats.dispositionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats && stats.dispositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart> */}
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">📋 Disposition Table</h3>
                <div className="overflow-y-auto max-h-80">
                  <table className="w-full">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Disposition</th>
                        <th className="px-4 py-2 text-right font-semibold">Count</th>
                        <th className="px-4 py-2 text-right font-semibold">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats && stats.dispositions.map((disp, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="px-4 py-2">{disp.value}</td>
                          <td className="px-4 py-2 text-right font-semibold">{disp.count}</td>
                          <td className="px-4 py-2 text-right">{((disp.count / totalDispositionCount) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
                        
            {/* Top Services/Campaigns */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">🏆 Top Campaigns/Services</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats?.Services ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE">
                    {stats && stats.Services.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>


            {/* Dialer Type Comparison */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">📞 Dialer Type Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full mb-6">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Dialer Type</th>
                      <th className="px-4 py-3 text-right font-semibold">Total Calls</th>
                      <th className="px-4 py-3 text-right font-semibold">Answered</th>
                      <th className="px-4 py-3 text-right font-semibold">Answer Rate</th>
                      <th className="px-4 py-3 text-right font-semibold">Avg AHT (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dialerComparison.map((dialer, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3 font-medium">{dialer.name}</td>
                        <td className="px-4 py-3 text-right">{dialer.total}</td>
                        <td className="px-4 py-3 text-right">{dialer.answered}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            parseFloat(dialer.answerRate) > 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dialer.answerRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{dialer.avgAHT}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dialerComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total" fill="#0088FE" name="Total Calls" />
                    <Bar yAxisId="left" dataKey="answered" fill="#00C49F" name="Answered" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div> */}

            {/* Hourly Call Volume Heatmap */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">🔥 Hourly Call Volume Heatmap</h3>
              <p className="text-gray-600 mb-4">Call distribution by date and hour</p>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-24 gap-1 text-xs mb-2">
                  {Array.from({length: 24}, (_, i) => (
                    <div key={i} className="text-center font-semibold text-gray-600">
                      {String(i).padStart(2, '0')}
                    </div>
                  ))}
                </div>
                {[...new Set(data.map(d => d.Date))].sort().slice(0, 15).map(date => (
                  <div key={date} className="flex items-center gap-2 mb-1">
                    <div className="w-20 text-xs font-medium text-gray-700">{date.slice(5)}</div>
                    <div className="grid grid-cols-24 gap-1 flex-1">
                      {Array.from({length: 24}, (_, hour) => {
                        const count = heatmapData.find(h => h.date === date.slice(5) && h.hour === `${String(hour).padStart(2, '0')}:00`)?.count || 0;
                        const intensity = Math.min(count / 5, 1);
                        return (
                          <div
                            key={hour}
                            className="aspect-square rounded"
                            style={{
                              backgroundColor: count === 0 ? '#f3f4f6' : `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`,
                            }}
                            title={`${date} ${String(hour).padStart(2, '0')}:00 - ${count} calls`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="font-semibold">Legend:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>0 calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{backgroundColor: 'rgba(59, 130, 246, 0.4)'}}></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{backgroundColor: 'rgba(59, 130, 246, 0.7)'}}></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{backgroundColor: 'rgba(59, 130, 246, 1)'}}></div>
                  <span>High</span>
                </div>
              </div>
            </div> */}
          </div>
        )}


        {/* agent tab *********************************************************************** */}
        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Agent Performance Leaderboard</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Rank</th>
                      <th className="px-4 py-3 text-left">Agent</th>
                      <th className="px-4 py-3 text-right">Total Calls</th>
                      <th className="px-4 py-3 text-right">Answered</th>
                      <th className="px-4 py-3 text-right">Answer Rate</th>
                      <th className="px-4 py-3 text-right">Avg AHT (min)</th>
                      <th className="px-4 py-3 text-left">Top Disposition</th>
                    </tr>
                  </thead>
                  {stats && sta}
                  <tbody>
                    {stats.agentPerformance.map((agent, idx) => (
                      <tr key={agent.agent} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-500' : idx === 2 ? 'text-orange-600' : ''}`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{agent.agent}</td>
                        <td className="px-4 py-3 text-right">{agent.total}</td>
                        <td className="px-4 py-3 text-right font-semibold">{agent.answered}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${parseFloat(agent.answerRate) > 80 ? 'text-green-600' : 'text-orange-600'}`}>
                            {agent.answerRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{agent.avgAHT}</td>
                        <td className="px-4 py-3 text-sm">{agent.topDisposition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Agent Performance Chart</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats && stats.agentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="answered" fill="#00C49F" name="Answered Calls" />
                  <Bar dataKey="total" fill="#0088FE" name="Total Calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TRENDS TAB */}
        {activeTab === 'trends' && (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Daily Call Trends</h3>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={hourlyConnectData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line
            type="monotone"
            dataKey="total"
            stroke="#0088FE"
            strokeWidth={2}
            name="Total Calls"
          />

          <Line
            type="monotone"
            dataKey="connected"
            stroke="#00C49F"
            strokeWidth={2}
            name="Connected Calls"
          />

          <Line
            type="monotone"
            dataKey="notConnected"
            stroke="#FF8042"
            strokeWidth={2}
            name="Not Connected"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)}

        {/* {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Daily Call Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={hourlyConnectData && hourlyConnectData.hourly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#0088FE" strokeWidth={2} name="Total Calls" />
                  <Line type="monotone" dataKey="answered" stroke="#00C49F" strokeWidth={2} name="Answered" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )} */}

        {/* DATA TAB */}
        {/* {activeTab === 'data' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Raw Call Data (First 100 records)</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={20} />
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">S_No</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Service</th>
                    <th className="px-3 py-2 text-left">Agent</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Talk (s)</th>
                    <th className="px-3 py-2 text-right">Hold (s)</th>
                    <th className="px-3 py-2 text-left">Disposition</th>
                    <th className="px-3 py-2 text-left">Dialer</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 100).map((row, idx) => (
                    <tr key={row.S_No} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-3 py-2">{row.S_No}</td>
                      <td className="px-3 py-2">{row.Date}</td>
                      <td className="px-3 py-2">{row.Service}</td>
                      <td className="px-3 py-2">{row.Agent}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          row.Call_Status?.includes('ANSWER') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {row.Call_Status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{row.Talk_Duration}</td>
                      <td className="px-3 py-2 text-right">{row.Hold_Duration}</td>
                      <td className="px-3 py-2">{row.Deposition}</td>
                      <td className="px-3 py-2">{row.Dialer_Type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}



      </div>
    </div>
  );
};

export default CallCenterDashboard;
