   
        const apiBaseUrl = 'https://pumpmaster-api-demo.azurewebsites.net/api/pumps';
        let chartInstance = null;

        async function loadPumpDetails() {
            const urlParams = new URLSearchParams(window.location.search);
            const pumpId = urlParams.get('id');

            if (!pumpId) {
                $('#pumpDetails').html('<div class="alert alert-danger">No pump ID provided.</div>');
                return;
            }

            try {
                const response = await fetch(`${apiBaseUrl}/${pumpId}`);
                if (!response.ok) throw new Error('Pump not found');

                const pump = await response.json();

                $('#pumpDetails').html(`
                    <ul class="list-group">
                        <li class="list-group-item"><strong>ID:</strong> ${pump.id}</li>
                        <li class="list-group-item"><strong>Type:</strong> ${pump.pumpType}</li>
                        <li class="list-group-item"><strong>Area:</strong> ${pump.area}</li>
                        <li class="list-group-item"><strong>Flow Rate:</strong> ${pump.flowRate} L/min</li>
                        <li class="list-group-item"><strong>Pressure:</strong> ${pump.currentPressure} bar</li>
                        <li class="list-group-item"><strong>Offset:</strong> ${pump.offset}</li>
                        <li class="list-group-item"><strong>Pressure Range:</strong> ${pump.minPressure} - ${pump.maxPressure} bar</li>
                        <li class="list-group-item"><strong>Coordinates:</strong> ${pump.latitude}, ${pump.longitude}</li>
                    </ul>
                `);

                const map = L.map('map').setView([pump.latitude, pump.longitude], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                }).addTo(map);

                L.marker([pump.latitude, pump.longitude])
                    .addTo(map)
                    .bindPopup(`<strong>${pump.pumpType}</strong><br>${pump.area}`)
                    .openPopup();

                renderChart(pump.pressureReadings);
                document.getElementById('chartType').addEventListener('change', () => {
                    renderChart(pump.pressureReadings);
                });

            } catch (err) {
                console.error(err);
                $('#pumpDetails').html('<div class="alert alert-danger">Error loading pump data.</div>');
            }
        }

        function renderChart(pressureReadings) {
            const ctx = document.getElementById('pressureChart').getContext('2d');
            const chartType = document.getElementById('chartType').value;

            const sorted = pressureReadings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const labels = sorted.map(r => new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            const data = sorted.map(r => r.pressure);

            if (chartInstance) {
                chartInstance.destroy();
            }

            chartInstance = new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Pressure (bar)',
                        data: data,
                        borderColor: '#007bff',
                        backgroundColor: chartType === 'bar' ? 'rgba(0, 123, 255, 0.5)' : 'transparent',
                        tension: 0.3,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Pressure (bar)'
                            }
                        }
                    }
                }
            });
        }

        $(document).ready(loadPumpDetails);