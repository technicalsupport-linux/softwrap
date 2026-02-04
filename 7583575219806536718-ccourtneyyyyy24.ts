const ComponentFunction = function() {
  // @section:imports @depends:[]
  const React = require('react');
  const { useState, useEffect, useContext, useMemo, useCallback } = React;
  const { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, StatusBar, ActivityIndicator, KeyboardAvoidingView, FlatList } = require('react-native');
  const { MaterialIcons } = require('@expo/vector-icons');
  const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
  // @end:imports

  // @section:theme @depends:[]
  const storageStrategy = 'local';
  const primaryColor = '#2E86AB';
  const accentColor = '#A23B72';
  const backgroundColor = '#F8FAFC';
  const cardColor = '#FFFFFF';
  const textPrimary = '#1F2937';
  const textSecondary = '#6B7280';
  const designStyle = 'modern';
  // @end:theme

  // @section:navigation-setup @depends:[]
  const Tab = createBottomTabNavigator();
  // @end:navigation-setup

  // @section:ThemeContext @depends:[theme]
  const ThemeContext = React.createContext();
  const ThemeProvider = function(props) {
    const darkModeState = useState(false);
    const darkMode = darkModeState[0];
    const setDarkMode = darkModeState[1];
    
    const lightTheme = useMemo(function() {
      return {
        colors: {
          primary: primaryColor,
          accent: accentColor,
          background: backgroundColor,
          card: cardColor,
          textPrimary: textPrimary,
          textSecondary: textSecondary,
          border: '#E5E7EB',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B'
        }
      };
    }, []);
    
    const darkTheme = useMemo(function() {
      return {
        colors: {
          primary: primaryColor,
          accent: accentColor,
          background: '#1F2937',
          card: '#374151',
          textPrimary: '#F9FAFB',
          textSecondary: '#D1D5DB',
          border: '#4B5563',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B'
        }
      };
    }, []);
    
    const theme = darkMode ? darkTheme : lightTheme;
    
    const toggleDarkMode = useCallback(function() {
      setDarkMode(function(prev) { return !prev; });
    }, []);
    
    const value = useMemo(function() {
      return { theme: theme, darkMode: darkMode, toggleDarkMode: toggleDarkMode, designStyle: designStyle };
    }, [theme, darkMode, toggleDarkMode]);
    
    return React.createElement(ThemeContext.Provider, { value: value }, props.children);
  };
  
  const useTheme = function() { return useContext(ThemeContext); };
  // @end:ThemeContext

  // @section:DiscoveryScreen-state @depends:[ThemeContext]
  const useDiscoveryState = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    const scanningState = useState(false);
    const isScanning = scanningState[0];
    const setIsScanning = scanningState[1];
    const devicesState = useState([]);
    const discoveredDevices = devicesState[0];
    const setDiscoveredDevices = devicesState[1];
    const selectedDeviceState = useState(null);
    const selectedDevice = selectedDeviceState[0];
    const setSelectedDevice = selectedDeviceState[1];
    const connectionModalState = useState(false);
    const showConnectionModal = connectionModalState[0];
    const setShowConnectionModal = connectionModalState[1];
    return {
      theme: theme,
      isScanning: isScanning,
      setIsScanning: setIsScanning,
      discoveredDevices: discoveredDevices,
      setDiscoveredDevices: setDiscoveredDevices,
      selectedDevice: selectedDevice,
      setSelectedDevice: setSelectedDevice,
      showConnectionModal: showConnectionModal,
      setShowConnectionModal: setShowConnectionModal
    };
  };
  // @end:DiscoveryScreen-state

  // @section:DiscoveryScreen-handlers @depends:[DiscoveryScreen-state]
  const discoveryHandlers = {
    startScan: function(state) {
      state.setIsScanning(true);
      state.setDiscoveredDevices([]);
      
      setTimeout(function() {
        const mockDevices = [
          { id: '1', name: 'iPhone 12 Pro', address: 'AA:BB:CC:DD:EE:FF', rssi: -45, type: 'smartphone' },
          { id: '2', name: 'AirPods Pro', address: 'BB:CC:DD:EE:FF:00', rssi: -30, type: 'headphones' },
          { id: '3', name: 'Samsung Galaxy S21', address: 'CC:DD:EE:FF:00:11', rssi: -60, type: 'smartphone' },
          { id: '4', name: 'Sony WH-1000XM4', address: 'DD:EE:FF:00:11:22', rssi: -55, type: 'headphones' },
          { id: '5', name: 'MacBook Pro', address: 'EE:FF:00:11:22:33', rssi: -70, type: 'computer' }
        ];
        state.setDiscoveredDevices(mockDevices);
        state.setIsScanning(false);
      }, 3000);
    },
    
    selectDevice: function(state, device) {
      state.setSelectedDevice(device);
      state.setShowConnectionModal(true);
    },
    
    connectToDevice: function(state, device) {
      Platform.OS === 'web' ? window.alert('Connecting to ' + device.name + '...') : Alert.alert('Connection', 'Connecting to ' + device.name + '...');
      state.setShowConnectionModal(false);
      
      setTimeout(function() {
        Platform.OS === 'web' ? window.alert('Successfully connected to ' + device.name) : Alert.alert('Success', 'Successfully connected to ' + device.name);
      }, 1500);
    }
  };
  // @end:DiscoveryScreen-handlers

  // @section:DiscoveryScreen-DeviceItem @depends:[styles]
  const renderDeviceItem = function(device, theme, onPress) {
    const getDeviceIcon = function(type) {
      switch(type) {
        case 'smartphone': return 'smartphone';
        case 'headphones': return 'headphones';
        case 'computer': return 'computer';
        default: return 'bluetooth';
      }
    };
    
    const getSignalStrength = function(rssi) {
      if (rssi > -40) return 'excellent';
      if (rssi > -55) return 'good';
      if (rssi > -70) return 'fair';
      return 'poor';
    };
    
    const signalStrength = getSignalStrength(device.rssi);
    const signalColor = signalStrength === 'excellent' ? theme.colors.success :
                       signalStrength === 'good' ? '#10B981' :
                       signalStrength === 'fair' ? theme.colors.warning : theme.colors.error;
    
    return React.createElement(TouchableOpacity, {
      style: [styles.deviceItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
      onPress: function() { onPress(device); },
      componentId: 'device-item-' + device.id
    },
      React.createElement(View, { style: styles.deviceIcon, componentId: 'device-icon-' + device.id },
        React.createElement(MaterialIcons, { name: getDeviceIcon(device.type), size: 32, color: theme.colors.primary })
      ),
      React.createElement(View, { style: styles.deviceInfo, componentId: 'device-info-' + device.id },
        React.createElement(Text, { style: [styles.deviceName, { color: theme.colors.textPrimary }], componentId: 'device-name-' + device.id }, device.name),
        React.createElement(Text, { style: [styles.deviceAddress, { color: theme.colors.textSecondary }], componentId: 'device-address-' + device.id }, device.address)
      ),
      React.createElement(View, { style: styles.signalContainer, componentId: 'signal-container-' + device.id },
        React.createElement(MaterialIcons, { name: 'signal-cellular-4-bar', size: 20, color: signalColor }),
        React.createElement(Text, { style: [styles.rssiText, { color: theme.colors.textSecondary }], componentId: 'rssi-' + device.id }, device.rssi + ' dBm')
      )
    );
  };
  // @end:DiscoveryScreen-DeviceItem

  // @section:DiscoveryScreen-Modal @depends:[styles]
  const renderConnectionModal = function(visible, device, onClose, onConnect, theme) {
    if (!device) return null;
    
    return React.createElement(Modal, {
      visible: visible,
      animationType: 'slide',
      transparent: true,
      onRequestClose: onClose
    },
      React.createElement(View, { style: styles.modalOverlay, componentId: 'connection-modal-overlay' },
        React.createElement(View, { style: [styles.modalContent, { backgroundColor: theme.colors.card }], componentId: 'connection-modal-content' },
          React.createElement(View, { style: styles.modalHeader, componentId: 'modal-header' },
            React.createElement(Text, { style: [styles.modalTitle, { color: theme.colors.textPrimary }], componentId: 'modal-title' }, 'Connect to Device'),
            React.createElement(TouchableOpacity, { onPress: onClose, componentId: 'modal-close' },
              React.createElement(MaterialIcons, { name: 'close', size: 24, color: theme.colors.textSecondary })
            )
          ),
          React.createElement(View, { style: styles.modalBody, componentId: 'modal-body' },
            React.createElement(Text, { style: [styles.modalDeviceName, { color: theme.colors.textPrimary }], componentId: 'modal-device-name' }, device.name),
            React.createElement(Text, { style: [styles.modalDeviceAddress, { color: theme.colors.textSecondary }], componentId: 'modal-device-address' }, device.address),
            React.createElement(Text, { style: [styles.modalDescription, { color: theme.colors.textSecondary }], componentId: 'modal-description' }, 
              'Are you sure you want to connect to this device? Make sure the device is in pairing mode.')
          ),
          React.createElement(View, { style: styles.modalActions, componentId: 'modal-actions' },
            React.createElement(TouchableOpacity, {
              style: [styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }],
              onPress: onClose,
              componentId: 'cancel-button'
            },
              React.createElement(Text, { style: [styles.buttonText, { color: theme.colors.textSecondary }], componentId: 'cancel-text' }, 'Cancel')
            ),
            React.createElement(TouchableOpacity, {
              style: [styles.modalButton, styles.connectButton, { backgroundColor: theme.colors.primary }],
              onPress: function() { onConnect(device); },
              componentId: 'connect-button'
            },
              React.createElement(Text, { style: [styles.buttonText, { color: '#FFFFFF' }], componentId: 'connect-text' }, 'Connect')
            )
          )
        )
      )
    );
  };
  // @end:DiscoveryScreen-Modal

  // @section:DiscoveryScreen @depends:[DiscoveryScreen-state,DiscoveryScreen-handlers,DiscoveryScreen-DeviceItem,DiscoveryScreen-Modal,styles]
  const DiscoveryScreen = function() {
    const state = useDiscoveryState();
    const handlers = discoveryHandlers;
    
    return React.createElement(View, { style: [styles.container, { backgroundColor: state.theme.colors.background }], componentId: 'discovery-screen' },
      React.createElement(View, { style: [styles.header, { backgroundColor: state.theme.colors.card, borderBottomColor: state.theme.colors.border }], componentId: 'discovery-header' },
        React.createElement(Text, { style: [styles.headerTitle, { color: state.theme.colors.textPrimary }], componentId: 'discovery-title' }, 'Discover Devices'),
        React.createElement(TouchableOpacity, {
          style: [styles.scanButton, { backgroundColor: state.isScanning ? state.theme.colors.textSecondary : state.theme.colors.primary }],
          onPress: function() { if (!state.isScanning) handlers.startScan(state); },
          disabled: state.isScanning,
          componentId: 'scan-button'
        },
          state.isScanning ? 
            React.createElement(ActivityIndicator, { size: 'small', color: '#FFFFFF', componentId: 'scanning-indicator' }) :
            React.createElement(MaterialIcons, { name: 'bluetooth-searching', size: 20, color: '#FFFFFF' }),
          React.createElement(Text, { style: [styles.scanButtonText, { color: '#FFFFFF' }], componentId: 'scan-button-text' }, 
            state.isScanning ? 'Scanning...' : 'Start Scan')
        )
      ),
      state.discoveredDevices.length > 0 ? 
        React.createElement(FlatList, {
          data: state.discoveredDevices,
          keyExtractor: function(item) { return item.id; },
          renderItem: function(info) {
            return renderDeviceItem(info.item, state.theme, function(device) { handlers.selectDevice(state, device); });
          },
          style: styles.devicesList,
          contentContainerStyle: { paddingBottom: Platform.OS === 'web' ? 90 : 100 },
          componentId: 'devices-list'
        }) :
        React.createElement(View, { style: styles.emptyState, componentId: 'empty-state' },
          React.createElement(MaterialIcons, { name: 'bluetooth-disabled', size: 64, color: state.theme.colors.textSecondary }),
          React.createElement(Text, { style: [styles.emptyStateText, { color: state.theme.colors.textSecondary }], componentId: 'empty-state-text' }, 
            'No devices found. Tap "Start Scan" to discover nearby Bluetooth devices.')
        ),
      renderConnectionModal(
        state.showConnectionModal,
        state.selectedDevice,
        function() { state.setShowConnectionModal(false); },
        function(device) { handlers.connectToDevice(state, device); },
        state.theme
      )
    );
  };
  // @end:DiscoveryScreen

  // @section:HistoryScreen-state @depends:[ThemeContext]
  const useHistoryState = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    const connectionHistoryState = useState([
      { id: '1', deviceName: 'AirPods Pro', address: 'BB:CC:DD:EE:FF:00', timestamp: '2024-01-15 14:30', status: 'connected', duration: '2h 15m' },
      { id: '2', deviceName: 'Sony WH-1000XM4', address: 'DD:EE:FF:00:11:22', timestamp: '2024-01-14 09:15', status: 'disconnected', duration: '45m' },
      { id: '3', deviceName: 'iPhone 12 Pro', address: 'AA:BB:CC:DD:EE:FF', timestamp: '2024-01-13 16:45', status: 'failed', duration: '0m' },
      { id: '4', deviceName: 'MacBook Pro', address: 'EE:FF:00:11:22:33', timestamp: '2024-01-12 11:20', status: 'connected', duration: '3h 22m' }
    ]);
    const connectionHistory = connectionHistoryState[0];
    const setConnectionHistory = connectionHistoryState[1];
    
    const pairedDevicesState = useState([
      { id: '1', name: 'AirPods Pro', address: 'BB:CC:DD:EE:FF:00', lastConnected: '2024-01-15 14:30', type: 'headphones' },
      { id: '2', name: 'MacBook Pro', address: 'EE:FF:00:11:22:33', lastConnected: '2024-01-12 11:20', type: 'computer' }
    ]);
    const pairedDevices = pairedDevicesState[0];
    const setPairedDevices = pairedDevicesState[1];
    
    const activeTabState = useState('history');
    const activeTab = activeTabState[0];
    const setActiveTab = activeTabState[1];
    
    return {
      theme: theme,
      connectionHistory: connectionHistory,
      setConnectionHistory: setConnectionHistory,
      pairedDevices: pairedDevices,
      setPairedDevices: setPairedDevices,
      activeTab: activeTab,
      setActiveTab: setActiveTab
    };
  };
  // @end:HistoryScreen-state

  // @section:HistoryScreen-handlers @depends:[HistoryScreen-state]
  const historyHandlers = {
    clearHistory: function(state) {
      Platform.OS === 'web' ? 
        window.confirm('Are you sure you want to clear all connection history?') && state.setConnectionHistory([]) :
        Alert.alert('Clear History', 'Are you sure you want to clear all connection history?', [
          { text: 'Cancel' },
          { text: 'Clear', onPress: function() { state.setConnectionHistory([]); } }
        ]);
    },
    
    removePairedDevice: function(state, deviceId) {
      state.setPairedDevices(function(prev) {
        return prev.filter(function(device) { return device.id !== deviceId; });
      });
    }
  };
  // @end:HistoryScreen-handlers

  // @section:HistoryScreen-HistoryItem @depends:[styles]
  const renderHistoryItem = function(item, theme) {
    const getStatusColor = function(status) {
      switch(status) {
        case 'connected': return theme.colors.success;
        case 'disconnected': return theme.colors.warning;
        case 'failed': return theme.colors.error;
        default: return theme.colors.textSecondary;
      }
    };
    
    const getStatusIcon = function(status) {
      switch(status) {
        case 'connected': return 'check-circle';
        case 'disconnected': return 'remove-circle';
        case 'failed': return 'error';
        default: return 'help';
      }
    };
    
    return React.createElement(View, {
      style: [styles.historyItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
      componentId: 'history-item-' + item.id
    },
      React.createElement(View, { style: styles.historyItemContent, componentId: 'history-content-' + item.id },
        React.createElement(Text, { style: [styles.historyDeviceName, { color: theme.colors.textPrimary }], componentId: 'history-name-' + item.id }, item.deviceName),
        React.createElement(Text, { style: [styles.historyDeviceAddress, { color: theme.colors.textSecondary }], componentId: 'history-address-' + item.id }, item.address),
        React.createElement(Text, { style: [styles.historyTimestamp, { color: theme.colors.textSecondary }], componentId: 'history-time-' + item.id }, item.timestamp),
        React.createElement(Text, { style: [styles.historyDuration, { color: theme.colors.textSecondary }], componentId: 'history-duration-' + item.id }, 'Duration: ' + item.duration)
      ),
      React.createElement(View, { style: styles.historyStatus, componentId: 'history-status-' + item.id },
        React.createElement(MaterialIcons, { name: getStatusIcon(item.status), size: 24, color: getStatusColor(item.status) }),
        React.createElement(Text, { style: [styles.statusText, { color: getStatusColor(item.status) }], componentId: 'status-text-' + item.id }, 
          item.status.charAt(0).toUpperCase() + item.status.slice(1))
      )
    );
  };
  // @end:HistoryScreen-HistoryItem

  // @section:HistoryScreen-PairedItem @depends:[styles]
  const renderPairedItem = function(item, theme, onRemove) {
    const getDeviceIcon = function(type) {
      switch(type) {
        case 'smartphone': return 'smartphone';
        case 'headphones': return 'headphones';
        case 'computer': return 'computer';
        default: return 'bluetooth';
      }
    };
    
    return React.createElement(View, {
      style: [styles.pairedItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
      componentId: 'paired-item-' + item.id
    },
      React.createElement(View, { style: styles.pairedIcon, componentId: 'paired-icon-' + item.id },
        React.createElement(MaterialIcons, { name: getDeviceIcon(item.type), size: 32, color: theme.colors.primary })
      ),
      React.createElement(View, { style: styles.pairedInfo, componentId: 'paired-info-' + item.id },
        React.createElement(Text, { style: [styles.pairedName, { color: theme.colors.textPrimary }], componentId: 'paired-name-' + item.id }, item.name),
        React.createElement(Text, { style: [styles.pairedAddress, { color: theme.colors.textSecondary }], componentId: 'paired-address-' + item.id }, item.address),
        React.createElement(Text, { style: [styles.pairedLastConnected, { color: theme.colors.textSecondary }], componentId: 'paired-last-' + item.id }, 
          'Last connected: ' + item.lastConnected)
      ),
      React.createElement(TouchableOpacity, {
        style: styles.removeButton,
        onPress: function() { onRemove(item.id); },
        componentId: 'remove-button-' + item.id
      },
        React.createElement(MaterialIcons, { name: 'delete', size: 24, color: theme.colors.error })
      )
    );
  };
  // @end:HistoryScreen-PairedItem

  // @section:HistoryScreen @depends:[HistoryScreen-state,HistoryScreen-handlers,HistoryScreen-HistoryItem,HistoryScreen-PairedItem,styles]
  const HistoryScreen = function() {
    const state = useHistoryState();
    const handlers = historyHandlers;
    
    return React.createElement(View, { style: [styles.container, { backgroundColor: state.theme.colors.background }], componentId: 'history-screen' },
      React.createElement(View, { style: [styles.header, { backgroundColor: state.theme.colors.card, borderBottomColor: state.theme.colors.border }], componentId: 'history-header' },
        React.createElement(Text, { style: [styles.headerTitle, { color: state.theme.colors.textPrimary }], componentId: 'history-title' }, 'Connection History'),
        React.createElement(View, { style: styles.tabContainer, componentId: 'tab-container' },
          React.createElement(TouchableOpacity, {
            style: [styles.tabButton, state.activeTab === 'history' && { backgroundColor: state.theme.colors.primary }],
            onPress: function() { state.setActiveTab('history'); },
            componentId: 'history-tab'
          },
            React.createElement(Text, { style: [styles.tabText, { color: state.activeTab === 'history' ? '#FFFFFF' : state.theme.colors.textSecondary }], componentId: 'history-tab-text' }, 'History')
          ),
          React.createElement(TouchableOpacity, {
            style: [styles.tabButton, state.activeTab === 'paired' && { backgroundColor: state.theme.colors.primary }],
            onPress: function() { state.setActiveTab('paired'); },
            componentId: 'paired-tab'
          },
            React.createElement(Text, { style: [styles.tabText, { color: state.activeTab === 'paired' ? '#FFFFFF' : state.theme.colors.textSecondary }], componentId: 'paired-tab-text' }, 'Paired')
          )
        )
      ),
      state.activeTab === 'history' ? 
        React.createElement(View, { style: styles.tabContent, componentId: 'history-content' },
          state.connectionHistory.length > 0 ? 
            React.createElement(FlatList, {
              data: state.connectionHistory,
              keyExtractor: function(item) { return item.id; },
              renderItem: function(info) {
                return renderHistoryItem(info.item, state.theme);
              },
              style: styles.historyList,
              contentContainerStyle: { paddingBottom: Platform.OS === 'web' ? 90 : 100 },
              componentId: 'history-flat-list'
            }) :
            React.createElement(View, { style: styles.emptyState, componentId: 'history-empty' },
              React.createElement(MaterialIcons, { name: 'history', size: 64, color: state.theme.colors.textSecondary }),
              React.createElement(Text, { style: [styles.emptyStateText, { color: state.theme.colors.textSecondary }], componentId: 'history-empty-text' }, 
                'No connection history yet. Connect to a device to see your history here.')
            ),
          state.connectionHistory.length > 0 && React.createElement(TouchableOpacity, {
            style: [styles.clearButton, { backgroundColor: state.theme.colors.error }],
            onPress: function() { handlers.clearHistory(state); },
            componentId: 'clear-history-button'
          },
            React.createElement(Text, { style: [styles.clearButtonText, { color: '#FFFFFF' }], componentId: 'clear-button-text' }, 'Clear History')
          )
        ) :
        React.createElement(View, { style: styles.tabContent, componentId: 'paired-content' },
          state.pairedDevices.length > 0 ? 
            React.createElement(FlatList, {
              data: state.pairedDevices,
              keyExtractor: function(item) { return item.id; },
              renderItem: function(info) {
                return renderPairedItem(info.item, state.theme, function(id) { handlers.removePairedDevice(state, id); });
              },
              style: styles.pairedList,
              contentContainerStyle: { paddingBottom: Platform.OS === 'web' ? 90 : 100 },
              componentId: 'paired-flat-list'
            }) :
            React.createElement(View, { style: styles.emptyState, componentId: 'paired-empty' },
              React.createElement(MaterialIcons, { name: 'bluetooth-disabled', size: 64, color: state.theme.colors.textSecondary }),
              React.createElement(Text, { style: [styles.emptyStateText, { color: state.theme.colors.textSecondary }], componentId: 'paired-empty-text' }, 
                'No paired devices yet. Pair with a device to see it here.')
            )
        )
    );
  };
  // @end:HistoryScreen

  // @section:SettingsScreen @depends:[ThemeContext,styles]
  const SettingsScreen = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    
    return React.createElement(View, { style: [styles.container, { backgroundColor: theme.colors.background }], componentId: 'settings-screen' },
      React.createElement(View, { style: [styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }], componentId: 'settings-header' },
        React.createElement(Text, { style: [styles.headerTitle, { color: theme.colors.textPrimary }], componentId: 'settings-title' }, 'Settings')
      ),
      React.createElement(ScrollView, { 
        style: styles.settingsContent,
        contentContainerStyle: { paddingBottom: Platform.OS === 'web' ? 90 : 100 },
        componentId: 'settings-scroll'
      },
        React.createElement(View, { style: [styles.settingsSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }], componentId: 'bluetooth-section' },
          React.createElement(Text, { style: [styles.sectionTitle, { color: theme.colors.textPrimary }], componentId: 'bluetooth-title' }, 'Bluetooth Settings'),
          React.createElement(TouchableOpacity, { style: styles.settingsItem, componentId: 'bluetooth-status' },
            React.createElement(MaterialIcons, { name: 'bluetooth', size: 24, color: theme.colors.primary }),
            React.createElement(View, { style: styles.settingsItemContent, componentId: 'bluetooth-content' },
              React.createElement(Text, { style: [styles.settingsItemText, { color: theme.colors.textPrimary }], componentId: 'bluetooth-text' }, 'Bluetooth Status'),
              React.createElement(Text, { style: [styles.settingsItemSubtext, { color: theme.colors.textSecondary }], componentId: 'bluetooth-subtext' }, 'Enabled')
            ),
            React.createElement(MaterialIcons, { name: 'chevron-right', size: 24, color: theme.colors.textSecondary })
          ),
          React.createElement(TouchableOpacity, { style: styles.settingsItem, componentId: 'visibility' },
            React.createElement(MaterialIcons, { name: 'visibility', size: 24, color: theme.colors.primary }),
            React.createElement(View, { style: styles.settingsItemContent, componentId: 'visibility-content' },
              React.createElement(Text, { style: [styles.settingsItemText, { color: theme.colors.textPrimary }], componentId: 'visibility-text' }, 'Device Visibility'),
              React.createElement(Text, { style: [styles.settingsItemSubtext, { color: theme.colors.textSecondary }], componentId: 'visibility-subtext' }, 'Discoverable for 2 minutes')
            ),
            React.createElement(MaterialIcons, { name: 'chevron-right', size: 24, color: theme.colors.textSecondary })
          )
        ),
        React.createElement(View, { style: [styles.settingsSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }], componentId: 'app-section' },
          React.createElement(Text, { style: [styles.sectionTitle, { color: theme.colors.textPrimary }], componentId: 'app-title' }, 'App Settings'),
          React.createElement(TouchableOpacity, { 
            style: styles.settingsItem,
            onPress: themeContext.toggleDarkMode,
            componentId: 'theme-toggle'
          },
            React.createElement(MaterialIcons, { name: themeContext.darkMode ? 'light-mode' : 'dark-mode', size: 24, color: theme.colors.primary }),
            React.createElement(View, { style: styles.settingsItemContent, componentId: 'theme-content' },
              React.createElement(Text, { style: [styles.settingsItemText, { color: theme.colors.textPrimary }], componentId: 'theme-text' }, 'Theme'),
              React.createElement(Text, { style: [styles.settingsItemSubtext, { color: theme.colors.textSecondary }], componentId: 'theme-subtext' }, themeContext.darkMode ? 'Dark Mode' : 'Light Mode')
            ),
            React.createElement(MaterialIcons, { name: 'chevron-right', size: 24, color: theme.colors.textSecondary })
          ),
          React.createElement(TouchableOpacity, { style: styles.settingsItem, componentId: 'notifications' },
            React.createElement(MaterialIcons, { name: 'notifications', size: 24, color: theme.colors.primary }),
            React.createElement(View, { style: styles.settingsItemContent, componentId: 'notifications-content' },
              React.createElement(Text, { style: [styles.settingsItemText, { color: theme.colors.textPrimary }], componentId: 'notifications-text' }, 'Notifications'),
              React.createElement(Text, { style: [styles.settingsItemSubtext, { color: theme.colors.textSecondary }], componentId: 'notifications-subtext' }, 'Enabled')
            ),
            React.createElement(MaterialIcons, { name: 'chevron-right', size: 24, color: theme.colors.textSecondary })
          )
        ),
        React.createElement(View, { style: [styles.settingsSection, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }], componentId: 'about-section' },
          React.createElement(Text, { style: [styles.sectionTitle, { color: theme.colors.textPrimary }], componentId: 'about-title' }, 'About'),
          React.createElement(TouchableOpacity, { style: styles.settingsItem, componentId: 'version' },
            React.createElement(MaterialIcons, { name: 'info', size: 24, color: theme.colors.primary }),
            React.createElement(View, { style: styles.settingsItemContent, componentId: 'version-content' },
              React.createElement(Text, { style: [styles.settingsItemText, { color: theme.colors.textPrimary }], componentId: 'version-text' }, 'Version'),
              React.createElement(Text, { style: [styles.settingsItemSubtext, { color: theme.colors.textSecondary }], componentId: 'version-subtext' }, '1.0.0')
            )
          )
        )
      )
    );
  };
  // @end:SettingsScreen

  // @section:TabNavigator @depends:[DiscoveryScreen,HistoryScreen,SettingsScreen,navigation-setup]
  const TabNavigator = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    
    return React.createElement(View, { style: { flex: 1, width: '100%', height: '100%', overflow: 'hidden' }, componentId: 'tab-navigator-wrapper' },
      React.createElement(Tab.Navigator, {
        screenOptions: function(options) {
          return {
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
              height: Platform.OS === 'web' ? 80 : 90,
              paddingBottom: Platform.OS === 'web' ? 10 : 20,
              paddingTop: 10
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600'
            }
          };
        },
        componentId: 'tab-navigator'
      },
        React.createElement(Tab.Screen, {
          name: 'Discovery',
          component: DiscoveryScreen,
          options: {
            tabBarIcon: function(props) {
              return React.createElement(MaterialIcons, { 
                name: 'bluetooth-searching', 
                size: 24, 
                color: props.color 
              });
            }
          }
        }),
        React.createElement(Tab.Screen, {
          name: 'History',
          component: HistoryScreen,
          options: {
            tabBarIcon: function(props) {
              return React.createElement(MaterialIcons, { 
                name: 'history', 
                size: 24, 
                color: props.color 
              });
            }
          }
        }),
        React.createElement(Tab.Screen, {
          name: 'Settings',
          component: SettingsScreen,
          options: {
            tabBarIcon: function(props) {
              return React.createElement(MaterialIcons, { 
                name: 'settings', 
                size: 24, 
                color: props.color 
              });
            }
          }
        })
      )
    );
  };
  // @end:TabNavigator

  // @section:styles @depends:[theme]
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%'
    },
    header: {
      paddingTop: Platform.OS === 'web' ? 20 : 50,
      paddingHorizontal: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700'
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 8
    },
    scanButtonText: {
      fontSize: 14,
      fontWeight: '600'
    },
    devicesList: {
      flex: 1,
      paddingHorizontal: 16
    },
    deviceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    deviceIcon: {
      marginRight: 16
    },
    deviceInfo: {
      flex: 1
    },
    deviceName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    deviceAddress: {
      fontSize: 14
    },
    signalContainer: {
      alignItems: 'center',
      gap: 4
    },
    rssiText: {
      fontSize: 12
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40
    },
    emptyStateText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 16,
      lineHeight: 24
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB'
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700'
    },
    modalBody: {
      padding: 20
    },
    modalDeviceName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8
    },
    modalDeviceAddress: {
      fontSize: 14,
      marginBottom: 16
    },
    modalDescription: {
      fontSize: 14,
      lineHeight: 20
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      gap: 12
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center'
    },
    cancelButton: {
      borderWidth: 1
    },
    connectButton: {},
    buttonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      padding: 4
    },
    tabButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center'
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600'
    },
    tabContent: {
      flex: 1
    },
    historyList: {
      flex: 1,
      paddingHorizontal: 16
    },
    historyItem: {
      flexDirection: 'row',
      padding: 16,
      marginVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    historyItemContent: {
      flex: 1
    },
    historyDeviceName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    historyDeviceAddress: {
      fontSize: 14,
      marginBottom: 8
    },
    historyTimestamp: {
      fontSize: 12,
      marginBottom: 4
    },
    historyDuration: {
      fontSize: 12
    },
    historyStatus: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 16
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
      textTransform: 'capitalize'
    },
    clearButton: {
      margin: 16,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center'
    },
    clearButtonText: {
      fontSize: 16,
      fontWeight: '600'
    },
    pairedList: {
      flex: 1,
      paddingHorizontal: 16
    },
    pairedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    pairedIcon: {
      marginRight: 16
    },
    pairedInfo: {
      flex: 1
    },
    pairedName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4
    },
    pairedAddress: {
      fontSize: 14,
      marginBottom: 4
    },
    pairedLastConnected: {
      fontSize: 12
    },
    removeButton: {
      padding: 8
    },
    settingsContent: {
      flex: 1,
      paddingHorizontal: 16
    },
    settingsSection: {
      marginVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      padding: 16,
      paddingBottom: 8
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    settingsItemContent: {
      flex: 1,
      marginLeft: 16
    },
    settingsItemText: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2
    },
    settingsItemSubtext: {
      fontSize: 14
    }
  });
  // @end:styles

  // @section:return @depends:[ThemeProvider,TabNavigator]
  return React.createElement(ThemeProvider, null,
    React.createElement(View, { style: { flex: 1, width: '100%', height: '100%' } },
      React.createElement(StatusBar, { barStyle: 'dark-content' }),
      React.createElement(TabNavigator)
    )
  );
  // @end:return
};
return ComponentFunction;
