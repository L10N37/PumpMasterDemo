        class PumpMasterApp {
            constructor() {
                this.apiBaseUrl = 'https://pumpmaster-auth.azurewebsites.net/api';
                this.pumpApiUrl = 'https://pumpmaster-api-demo.azurewebsites.net/api';
                this.currentUser = null;
                this.pumps = [];
                
                this.init();
            }
            
            init() {
                this.bindEvents();
                this.checkAuth();
                this.pumpModal = new bootstrap.Modal(document.getElementById('pumpModal'));
                $('#pumpForm').on('submit', (e) => this.handlePumpFormSubmit(e));
                $('#addPumpBtn').on('click', () => this.openPumpModal());
                $('#deletePumpBtn').on('click', () => this.handleDeletePump());

            }
            
            bindEvents() {
                $('#loginForm').on('submit', (e) => this.handleLogin(e));
                $('#logoutBtn').on('click', () => this.handleLogout());
                $('#refreshBtn').on('click', () => this.loadPumpData());
            }
            
            checkAuth() {
                const userData = localStorage.getItem('pumpMasterUser');
                if (userData) {
                    try {
                        this.currentUser = JSON.parse(userData);
                        this.showDashboard();
                        this.loadPumpData();
                    } catch (e) {
                        localStorage.removeItem('pumpMasterUser');
                        this.showLogin();
                    }
                } else {
                    this.showLogin();
                }
            }
            
            async handleLogin(e) {
                e.preventDefault();
                
                const username = $('#username').val();
                const password = $('#password').val();
                
                this.hideError('login');
                this.setButtonLoading('#loginForm button', true);
                
                try {
                    const response = await fetch(`${this.apiBaseUrl}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password }),
                    });
                    
                    if (response.ok) {
                        const userData = await response.json();
                        this.currentUser = { ...userData, username };
                        localStorage.setItem('pumpMasterUser', JSON.stringify(this.currentUser));
                        this.showDashboard();
                        this.loadPumpData();
                    } else {
                        const error = await response.json();
                        this.showError('login', error.message || 'Login failed. Please check your credentials.');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    this.showError('login', 'Network error. Please check your connection and try again.');
                } finally {
                    this.setButtonLoading('#loginForm button', false);
                }
            }
            
            handleLogout() {
                localStorage.removeItem('pumpMasterUser');
                this.currentUser = null;
                this.pumps = [];
                $('#loginForm')[0].reset();
                this.showLogin();
            }
            
            async loadPumpData() {
                if (!this.currentUser) return;
                
                this.showLoading(true);
                this.hideError('dashboard');
                
                try {
                    const response = await fetch(`${this.pumpApiUrl}/pumps`);
                    
                    if (response.ok) {
                        const allPumps = await response.json();

                        // NOTE: backend uses 'id' as user ID in pumps, not userId (as you said)
                        this.pumps = allPumps.filter(pump => pump.userId === this.currentUser.id);

                        this.renderPumpTable();
                        this.updateStats();
                        this.showLoading(false);
                        $('#pumpTableContainer').removeClass('hidden');
                        this.bindTableRowClicks();
                    } else {
                        throw new Error('Failed to load pump data');
                    }
                } catch (error) {
                    console.error('Error loading pumps:', error);
                    this.showError('dashboard', 'Failed to load pump data. Please try refreshing the page.');
                    this.showLoading(false);
                }
            }
            
                        renderPumpTable() {
                const tableBody = $('#pumpTableBody');
                tableBody.empty();

                this.pumps.forEach(pump => {
                    const status = this.getPressureStatus(pump);
                const row = `
                    <tr data-pump-id="${pump.id}">
                        <td><span class="pump-type-badge">${pump.pumpType}</span></td>
                        <td>
                            <small>
                                <i class="fas fa-map-marker-alt me-1"></i>
                                ${pump.latitude.toFixed(3)}, ${pump.longitude.toFixed(3)}
                            </small>
                        </td>
                        <td><strong>${pump.area}</strong></td>
                        <td>
                            <i class="fas fa-tint me-1 text-primary"></i>
                            ${pump.flowRate} L/min
                        </td>
                        <td>
                            <div>
                                <strong>${pump.currentPressure}</strong> bar
                            </div>
                            <small class="text-muted">
                                Range: ${pump.minPressure} - ${pump.maxPressure}
                            </small>
                        </td>
                        <td>${pump.offset}</td>
                        <td>
                            <span class="status-badge ${status.class}">
                                <i class="${status.icon} me-1"></i>
                                ${status.text}
                            </span>
                        </td>
                        <td>
                            <a href="pump-details.html?id=${pump.id}" class="btn btn-sm btn-primary">
                                <i class="fas fa-eye me-1"></i>View
                            </a>
                        </td>
                    </tr>
                `;
                    tableBody.append(row);
                });
            }

            
            bindTableRowClicks() {
                $('#pumpTableBody tr').off('click').on('click', (e) => {
                    const pumpId = $(e.currentTarget).data('pump-id');
                    this.openPumpModal(pumpId);
                });
            }

            openPumpModal(pumpId = null) {
                if (pumpId === null) {
                    $('#pumpModalLabel').text('Create New Pump');
                    $('#pumpForm')[0].reset();
                    $('#pumpId').val('');
                    $('#deletePumpBtn').hide(); // <== hide delete for new pumps
                } else {
                    const pump = this.pumps.find(p => p.id === pumpId);
                    if (!pump) return;

                    $('#pumpModalLabel').text(`Edit Pump #${pump.id}`);
                    $('#pumpId').val(pump.id);
                    $('#pumpType').val(pump.pumpType);
                    $('#area').val(pump.area);
                    $('#latitude').val(pump.latitude);
                    $('#longitude').val(pump.longitude);
                    $('#offset').val(pump.offset);
                    $('#minPressure').val(pump.minPressure);
                    $('#maxPressure').val(pump.maxPressure);
                    $('#deletePumpBtn').show(); // <== show delete for existing pumps
                }
                this.pumpModal.show();
            }

            async handleDeletePump() {
                const pumpId = $('#pumpId').val();
                if (!pumpId) return;

                if (!confirm(`Are you sure you want to delete pump #${pumpId}?`)) return;

                try {
                    const response = await fetch(`${this.pumpApiUrl}/pumps/${pumpId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        this.pumpModal.hide();
                        this.loadPumpData(); // Reload pump list
                    } else {
                        const error = await response.json();
                        alert('Error deleting pump: ' + (error.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error deleting pump:', error);
                    alert('Network error while deleting pump.');
                }
            }

            
            async handlePumpFormSubmit(e) {
                e.preventDefault();

                const pumpId = $('#pumpId').val();
                const pumpData = {
                    pumpType: $('#pumpType').val(),
                    area: $('#area').val(),
                    latitude: parseFloat($('#latitude').val()),
                    longitude: parseFloat($('#longitude').val()),
                    offset: parseFloat($('#offset').val()),
                    minPressure: parseFloat($('#minPressure').val()),
                    maxPressure: parseFloat($('#maxPressure').val()),
                    // We can add flowRate or currentPressure if needed, but original form doesn't include them
                };

                try {
                    let response;
                    if (pumpId) {
                        // Update existing pump
                        response = await fetch(`${this.pumpApiUrl}/pumps/${pumpId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(pumpData)
                        });
                    } else {
                        // Create new pump
                        // Add userId to associate
                        pumpData.userId = this.currentUser.id;
                        response = await fetch(`${this.pumpApiUrl}/pumps`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(pumpData)
                        });
                    }

                    if (response.ok) {
                        this.pumpModal.hide();
                        this.loadPumpData(); // Reload pump list
                    } else {
                        const error = await response.json();
                        alert('Error saving pump: ' + (error.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error saving pump:', error);
                    alert('Network error while saving pump.');
                }
            }
            
            getPressureStatus(pump) {
                const { currentPressure, minPressure, maxPressure } = pump;
                
                if (currentPressure < minPressure || currentPressure > maxPressure) {
                    return {
                        class: 'status-critical',
                        text: 'Critical',
                        icon: 'fas fa-times-circle'
                    };
                } else if (currentPressure <= minPressure + 0.2 || currentPressure >= maxPressure - 0.2) {
                    return {
                        class: 'status-warning',
                        text: 'Warning',
                        icon: 'fas fa-exclamation-triangle'
                    };
                } else {
                    return {
                        class: 'status-normal',
                        text: 'Normal',
                        icon: 'fas fa-check-circle'
                    };
                }
            }
            
            updateStats() {
                const total = this.pumps.length;
                let normal = 0, warning = 0, critical = 0;
                
                this.pumps.forEach(pump => {
                    const status = this.getPressureStatus(pump);
                    if (status.text === 'Normal') normal++;
                    else if (status.text === 'Warning') warning++;
                    else if (status.text === 'Critical') critical++;
                });
                
                $('#totalPumps').text(total);
                $('#normalPumps').text(normal);
                $('#warningPumps').text(warning);
                $('#criticalPumps').text(critical);
            }
            
            showLogin() {
                $('#loginPage').show();
                $('#dashboardPage').hide();
            }
            
            showDashboard() {
                $('#loginPage').hide();
                $('#dashboardPage').show();
                $('#usernameDisplay').text(this.currentUser.username);
            }
            
            showLoading(show) {
                if (show) {
                    $('#loading').show();
                    $('#pumpTableContainer').addClass('hidden');
                } else {
                    $('#loading').hide();
                }
            }
            
            showError(type, message) {
                $(`#${type}Error`).removeClass('hidden');
                $(`#${type}ErrorMessage`).text(message);
            }
            
            hideError(type) {
                $(`#${type}Error`).addClass('hidden');
            }
            
            setButtonLoading(selector, loading) {
                const button = $(selector);
                if (loading) {
                    button.prop('disabled', true);
                    const originalText = button.html();
                    button.data('original-text', originalText);
                    button.html('<i class="fas fa-spinner fa-spin me-2"></i>Please wait...');
                } else {
                    button.prop('disabled', false);
                    const originalText = button.data('original-text');
                    if (originalText) {
                        button.html(originalText);
                    }
                }
            }
        }
        
        // Initialise the application when document is ready
        $(document).ready(() => {
            new PumpMasterApp();
        });
    