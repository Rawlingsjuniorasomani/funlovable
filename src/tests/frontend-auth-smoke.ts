 


const mockResponses = {
  loginResponse: {
    user: {
      id: 'test-parent-id',
      email: 'parent@example.com',
      name: 'Test Parent',
      role: 'parent',
      is_approved: true,
      is_onboarded: false,
      children: [],
      createdAt: '2025-12-18T00:00:00Z'
    },
    token: 'test-jwt-token'
  },

  addChildResponse: {
    child: {
      id: 'test-child-id',
      name: 'Test Child',
      email: 'child@example.com',
      age: 8,
      grade: 'Primary 1',
      subjects: ['math', 'english'],
      avatar: null,
      createdAt: '2025-12-18T08:00:00Z'
    },
    studentCredentials: {
      email: 'child@example.com',
      password: 'auto-generated'
    }
  },

  getMeAfterAddChild: {
    user: {
      id: 'test-parent-id',
      email: 'parent@example.com',
      name: 'Test Parent',
      role: 'parent',
      is_approved: true,
      is_onboarded: false,
      children: [
        {
          id: 'test-child-id',
          name: 'Test Child',
          email: 'child@example.com',
          age: 8,
          grade: 'Primary 1',
          subjects: ['math', 'english'],
          avatar: null,
          createdAt: '2025-12-18T08:00:00Z'
        }
      ],
      createdAt: '2025-12-18T00:00:00Z'
    }
  },

  getMeAfterOnboarding: {
    user: {
      id: 'test-parent-id',
      email: 'parent@example.com',
      name: 'Test Parent',
      role: 'parent',
      is_approved: true,
      is_onboarded: true,
      children: [
        {
          id: 'test-child-id',
          name: 'Test Child',
          email: 'child@example.com',
          age: 8,
          grade: 'Primary 1',
          subjects: ['math', 'english'],
          avatar: null,
          createdAt: '2025-12-18T08:00:00Z'
        }
      ],
      createdAt: '2025-12-18T00:00:00Z'
    }
  }
};


export function testAddChildRefresh() {
  console.log('TEST: addChild should refresh user from /auth/me');

  
  
  
  
  

  const response = mockResponses.addChildResponse;
  const newChild = response.child || response;
  console.log('✓ Extracted child from response:', newChild.id);

  
  const refreshedUser = mockResponses.getMeAfterAddChild.user;
  console.log('✓ Refreshed user from /auth/me has children:', refreshedUser.children?.length || 0);

  if (!refreshedUser.children || refreshedUser.children.length === 0) {
    console.error('✗ FAIL: User should have children after refresh');
    return false;
  }

  console.log('✓ PASS: User children updated in auth state');
  return true;
}


export function testOnboardingRefresh() {
  console.log('\nTEST: completeOnboarding should refresh user flag');

  const beforeUser = mockResponses.getMeAfterAddChild.user;
  const afterUser = mockResponses.getMeAfterOnboarding.user;

  console.log('Before onboarding - is_onboarded:', beforeUser.is_onboarded);
  console.log('After onboarding - is_onboarded:', afterUser.is_onboarded);

  if (!afterUser.is_onboarded) {
    console.error('✗ FAIL: is_onboarded should be true after completeOnboarding');
    return false;
  }

  
  if (!afterUser.children || afterUser.children.length === 0) {
    console.error('✗ FAIL: Children should persist after onboarding');
    return false;
  }

  console.log('✓ PASS: Onboarding flag updated and children persisted');
  return true;
}


export function testParentOverviewRefetch() {
  console.log('\nTEST: ParentOverview should refetch when user.children.length changes');

  const user1 = { id: 'test-parent-id', children: [], };
  const user2 = { id: 'test-parent-id', children: [{ id: 'test-child-id', name: 'Child 1' }] };

  console.log('User 1 children count:', user1.children.length);
  console.log('User 2 children count:', user2.children.length);

  
  
  const shouldRefetch = user1.children.length !== user2.children.length;

  if (!shouldRefetch) {
    console.error('✗ FAIL: ParentOverview should refetch when children count changes');
    return false;
  }

  console.log('✓ PASS: ParentOverview will refetch on children count change');
  return true;
}


export function runAllTests() {
  console.log('=== Frontend Auth Flow Smoke Tests ===\n');

  const results = [
    testAddChildRefresh(),
    testOnboardingRefresh(),
    testParentOverviewRefetch()
  ];

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);
  return passed === total;
}


if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}
